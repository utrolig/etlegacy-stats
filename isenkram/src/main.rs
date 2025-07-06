use clap::Parser;
use http_body_util::{BodyExt, Full};
use hyper::body::Bytes;
use hyper::body::Incoming;
use hyper::service::service_fn;
use hyper::{HeaderMap, Request, Response, StatusCode};
use hyper_util::rt::TokioIo;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::convert::Infallible;
use std::fs;
use std::net::SocketAddr;
use std::path::Path;
use std::sync::Arc;
use tokio::net::TcpListener;
use tokio::sync::RwLock;

#[derive(Parser, Debug)]
#[command(name = "isenkram")]
#[command(about = "A caching HTTP proxy server")]
struct Args {
    #[arg(short, long, help = "Path to configuration file")]
    config: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Config {
    destination: String,
    bind: Option<String>,
    rewrites: Option<HashMap<String, String>>,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            destination: "".to_string(),
            bind: Some("127.0.0.1:3000".to_string()),
            rewrites: None,
        }
    }
}

#[derive(Clone)]
struct CacheEntry {
    status: StatusCode,
    headers: HeaderMap,
    body: Bytes,
    hit_count: u64,
}

type Cache = Arc<RwLock<HashMap<String, CacheEntry>>>;

fn load_config(config_path: Option<String>) -> Result<Config, Box<dyn std::error::Error>> {
    let config_path = config_path.unwrap_or_else(|| "isenkram.json".to_string());

    if !Path::new(&config_path).exists() {
        return Err(format!("Config file '{}' not found", config_path).into());
    }

    let config_content = fs::read_to_string(&config_path)?;
    let config: Config = serde_json::from_str(&config_content)?;

    if config.destination.is_empty() {
        return Err("destination cannot be empty in config file".into());
    }

    println!("Loaded configuration from {}", config_path);
    Ok(config)
}

async fn proxy_handler(
    req: Request<Incoming>,
    destination: String,
    cache: Cache,
    rewrites: Option<HashMap<String, String>>,
) -> Result<Response<Full<Bytes>>, Infallible> {
    let client = hyper_util::client::legacy::Client::builder(hyper_util::rt::TokioExecutor::new())
        .build_http();

    let uri = req.uri();
    let method = req.method().clone();
    let headers = req.headers().clone();

    let path = uri.path();

    // Check for rewrites first
    let (destination_url, is_rewrite) = if let Some(ref rewrites) = rewrites {
        if let Some(rewrite_url) = rewrites.get(path) {
            // Full rewrite - use the rewrite URL directly
            (rewrite_url.clone(), true)
        } else {
            // No rewrite found, use original destination
            (format!(
                "{}{}",
                destination,
                uri.path_and_query().map(|x| x.as_str()).unwrap_or("")
            ), false)
        }
    } else {
        // No rewrites configured, use original destination
        (format!(
            "{}{}",
            destination,
            uri.path_and_query().map(|x| x.as_str()).unwrap_or("")
        ), false)
    };

    // Check cache for GET requests only if not a rewrite
    if method == hyper::Method::GET && !is_rewrite {
        let cache_key = destination_url.clone();
        let mut cache_write = cache.write().await;
        if let Some(entry) = cache_write.get_mut(&cache_key) {
            // Cache hit - increment counter for this specific entry
            entry.hit_count += 1;
            let hit_count = entry.hit_count;

            let mut resp_builder = Response::builder().status(entry.status);
            for (name, value) in entry.headers.iter() {
                resp_builder = resp_builder.header(name, value);
            }
            resp_builder = resp_builder
                .header("X-Isenkram-Cache", "HIT")
                .header("X-Isenkram-Cache-Hits", hit_count.to_string());
            return Ok(resp_builder.body(Full::new(entry.body.clone())).unwrap());
        }
    }

    let body = match req.collect().await {
        Ok(collected) => collected.to_bytes(),
        Err(_) => {
            return Ok(Response::builder()
                .status(StatusCode::BAD_REQUEST)
                .body(Full::new(Bytes::from("Failed to read request body")))
                .unwrap());
        }
    };

    let mut proxy_req = Request::builder()
        .method(method.clone())
        .uri(destination_url.clone());

    for (name, value) in headers.iter() {
        proxy_req = proxy_req.header(name, value);
    }

    let proxy_req = proxy_req.body(Full::new(body)).unwrap();

    match client.request(proxy_req).await {
        Ok(response) => {
            let status = response.status();
            let headers = response.headers().clone();
            let body = match response.collect().await {
                Ok(collected) => collected.to_bytes(),
                Err(_) => Bytes::from("Failed to read response body"),
            };

            // Cache GET responses only if not a rewrite
            if method == hyper::Method::GET && !is_rewrite {
                let cache_entry = CacheEntry {
                    status,
                    headers: headers.clone(),
                    body: body.clone(),
                    hit_count: 0,
                };
                let mut cache_write = cache.write().await;
                cache_write.insert(destination_url, cache_entry);
            }

            let mut resp_builder = Response::builder().status(status);
            for (name, value) in headers.iter() {
                resp_builder = resp_builder.header(name, value);
            }

            // Add cache headers (MISS for new requests)
            resp_builder = resp_builder
                .header("X-Isenkram-Cache", "MISS")
                .header("X-Isenkram-Cache-Hits", "0");

            Ok(resp_builder.body(Full::new(body)).unwrap())
        }
        Err(e) => {
            eprintln!("Proxy request failed: {e}");
            Ok(Response::builder()
                .status(StatusCode::BAD_GATEWAY)
                .body(Full::new(Bytes::from(format!("Proxy error: {e}"))))
                .unwrap())
        }
    }
}

#[tokio::main]
async fn main() {
    let args = Args::parse();
    let config = load_config(args.config).expect("Failed to load configuration");

    let bind = config.bind.unwrap_or_else(|| "127.0.0.1:3000".to_string());
    let addr: SocketAddr = bind.parse().expect("Invalid bind address");
    let cache: Cache = Arc::new(RwLock::new(HashMap::new()));

    let listener = TcpListener::bind(addr)
        .await
        .expect("Failed to bind to address");
    println!("Proxy server listening on {addr}");
    println!("Proxying requests to {}", config.destination);
    
    // Log all rewrite paths on boot
    if let Some(ref rewrites) = config.rewrites {
        println!("Rewrite paths configured:");
        for (path, destination) in rewrites {
            println!("  {} -> {}", path, destination);
        }
    } else {
        println!("No rewrite paths configured");
    }

    loop {
        let (stream, _) = listener
            .accept()
            .await
            .expect("Failed to accept connection");
        let io = TokioIo::new(stream);
        let destination = config.destination.clone();
        let cache = cache.clone();
        let rewrites = config.rewrites.clone();

        tokio::task::spawn(async move {
            if let Err(err) = hyper::server::conn::http1::Builder::new()
                .serve_connection(
                    io,
                    service_fn(move |req| {
                        proxy_handler(req, destination.clone(), cache.clone(), rewrites.clone())
                    }),
                )
                .await
            {
                eprintln!("Error serving connection: {err:?}");
            }
        });
    }
}
