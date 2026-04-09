import urlJoin from "url-join";
import type {
  GameClass,
  Group,
  GroupDetails,
  GroupRound,
  Obituary,
  RawPlayerStats,
} from "./stats-types";

const BASE_URL = "https://api.etl.lol/api/v2/stats/etl";

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  next_page: number | null;
  prev_page: number | null;
};

export const statsApi = {
  async fetchUsersByGuid(guids: string[], apiToken: string) {
    if (guids.length === 0) return [];
    const url = urlJoin(
      BASE_URL,
      `/players/by-guid?${guids.map((guid) => `guid=${guid}`).join("&")}`,
    );
    const data = await getJsonOrDefault<PlayerInfo[]>([], url, {
      headers: {
        authorization: `Bearer ${apiToken}`,
      },
    });
    return data;
  },
  async fetchGroups({ page = 1, size }: { page: number; size?: number | string }) {
    const sp = new URLSearchParams();

    sp.append("page_size", "50");
    sp.append("page", page.toString());

    if (size) {
      sp.append("size", size.toString());
    }

    const url = urlJoin(BASE_URL, `/matches/groups?${sp.toString()}`);
    const data = await getJson<PaginatedResponse<Group>>(url);
    return data;
  },
  async fetchGroupDetails(groupId: string | number): Promise<GroupDetails> {
    const url = urlJoin(BASE_URL, "/matches/groups", groupId.toString());

    if (import.meta.env.DEV) {
      const { default: fs } = await import("fs");
      const { default: path } = await import("path");

      const filePath = path.join(
        process.cwd(),
        "/api-cache",
        `${groupId}.json`,
      );
      const cachedExists = fs.existsSync(filePath);

      if (cachedExists) {
        console.log(`Fetched ${groupId} from cache.`);
        return JSON.parse(fs.readFileSync(filePath).toString()) as GroupDetails;
      } else {
        console.log(`Fetched ${groupId} from api, and saved to cache.`);
        const data = await getJson<GroupDetails>(url);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return data;
      }
    }

    const data = await getJson<GroupDetails>(url);
    return data;
  },
  async searchGroups({
    query,
    fields,
    fuzzy,
    fuzzyThreshold,
    sortOrder,
    page = 1,
  }: {
    query: string;
    fields?: {
      original_match_id?: boolean;
      channel_name?: boolean;
      maps?: boolean;
      players?: boolean;
      server?: boolean;
    };
    page?: number;
    fuzzy?: boolean;
    fuzzyThreshold?: number;
    sortOrder?: "asc" | "desc";
  }) {
    const url = urlJoin(BASE_URL, "/matches/groups/search");

    const params = new URLSearchParams();

    params.append("query", query);

    if (fuzzy) {
      params.append("fuzzy", "true");
    }

    if (fuzzyThreshold) {
      params.append("fuzzy_threshold", fuzzyThreshold.toString());
    }

    if (sortOrder) {
      params.append("sort_order", sortOrder);
    }

    params.append("page", page.toString());

    for (const [key, value] of Object.entries(fields || {})) {
      if (value) {
        params.append("fields", key);
      }
    }

    const data = await getJson<PaginatedResponse<Group>>(
      `${url}?${params.toString()}`,
    );

    return data;
  },
};

async function getJsonOrDefault<T>(
  defaultData: T,
  ...args: Parameters<typeof fetch>
) {
  try {
    return await getJson<T>(...args);
  } catch {
    return defaultData as T;
  }
}

async function getJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const response = await fetch(input, {
    ...init,
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error("jsonFetch error", response);
    throw new Error(response.statusText);
  }

  return response.json() as Promise<T>;
}

export type Team = "alpha" | "beta";

export type Message = {
  message: string;
  timestamp: number;
  guid: string;
  command: "say" | "say_team" | "vsay" | "vsay_team";
};

export type Player = {
  id: string;
  nick: string;
  country?: string;
};

export type PlayerInfoDict = Record<string, PlayerInfo>;

export type PlayerInfo = {
  guid: string;
  discord_id: string;
  discord_nick: string;
  date_added: string;
};

export type {
  GameClass,
  Group,
  GroupDetails,
  GroupRound,
  Obituary,
  RawPlayerStats,
};
