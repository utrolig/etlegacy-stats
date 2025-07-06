use hyper::body::Incoming;
use hyper::service::service_fn;
use hyper::{Request, Response, StatusCode, HeaderMap};
use hyper_util::rt::TokioIo;
use std::convert::Infallible;
use std::net::SocketAddr;
use std::collections::HashMap;
use std::sync::Arc;
use std::env;
use tokio::sync::RwLock;
use tokio::net::TcpListener;
use http_body_util::{BodyExt, Full};
use hyper::body::Bytes;

#[derive(Clone)]
struct CacheEntry {
    status: StatusCode,
    headers: HeaderMap,
    body: Bytes,
    hit_count: u64,
}

type Cache = Arc<RwLock<HashMap<String, CacheEntry>>>;

async fn proxy_handler(
    req: Request<Incoming>,
    destination: String,
    cache: Cache,
) -> Result<Response<Full<Bytes>>, Infallible> {
    let client = hyper_util::client::legacy::Client::builder(hyper_util::rt::TokioExecutor::new())
        .build_http();
    
    let uri = req.uri();
    let method = req.method().clone();
    let headers = req.headers().clone();
    
    let destination_url = format!("{}{}", destination, uri.path_and_query().map(|x| x.as_str()).unwrap_or(""));
    
    // Check cache for GET requests
    if method == hyper::Method::GET {
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
        Err(_) => return Ok(Response::builder()
            .status(StatusCode::BAD_REQUEST)
            .body(Full::new(Bytes::from("Failed to read request body")))
            .unwrap()),
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
            
            // Cache GET responses
            if method == hyper::Method::GET {
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
    // Load .env file in development (ignore if file doesn't exist)
    let _ = dotenvy::dotenv();
    
    let destination = env::var("ISENKRAM_DESTINATION")
        .expect("ISENKRAM_DESTINATION environment variable is required");
    
    let bind = env::var("ISENKRAM_BIND")
        .unwrap_or_else(|_| "127.0.0.1:3000".to_string());
    
    let addr: SocketAddr = bind.parse().expect("Invalid bind address");
    let cache: Cache = Arc::new(RwLock::new(HashMap::new()));
    
    let listener = TcpListener::bind(addr).await.expect("Failed to bind to address");
    println!("Proxy server listening on {addr}");
    println!("Proxying requests to {destination}");
    
    loop {
        let (stream, _) = listener.accept().await.expect("Failed to accept connection");
        let io = TokioIo::new(stream);
        let destination = destination.clone();
        let cache = cache.clone();
        
        tokio::task::spawn(async move {
            if let Err(err) = hyper::server::conn::http1::Builder::new()
                .serve_connection(io, service_fn(move |req| {
                    proxy_handler(req, destination.clone(), cache.clone())
                }))
                .await
            {
                eprintln!("Error serving connection: {err:?}");
            }
        });
    }
}
