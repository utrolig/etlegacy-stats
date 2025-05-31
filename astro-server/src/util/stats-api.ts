import urlJoin from "url-join";

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
  async fetchGroups({ page = 1, size }: { page: number; size?: number }) {
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

async function getJson<T>(...args: Parameters<typeof fetch>) {
  const response = await fetch(...args);

  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error("jsonFetch error", response);
    throw new Error(response.statusText);
  }

  return response.json() as Promise<T>;
}

export type Team = "alpha" | "beta";

export type Group = {
  match_id: number;
  channel_name: string;
  state: "waiting_report" | "finished" | "cancelled" | "unknown match";
  size: number;
  start_time: number;
  end_time: number;
  maps: string[];
  alpha_team: string[];
  beta_team: string[];
  ranks_average: number;
  server: {
    ip: string;
    port: number;
    pw: string;
    instance: string;
  };
  winner: Team;
};

export type Obituary = {
  timestamp: number;
  target: string;
  victimRespawnTime: number;
  attacker: string;
  meansOfDeath: number;
  attackerRespawnTime: number;
};

export type GroupRound = {
  round_filename: string;
  round_data: {
    round_info: {
      defenderteam: number;
      servername: string;
      matchID: string;
      round: number;
      nextTimeLimit: string;
      timelimit: string;
      mapname: string;
      obituaries?: Obituary[];
      config: string;
      winnerteam: number;
      damageStats: {
        attacker: string;
        target: string;
        damageFlags: number;
        damage: number;
        timestamp: number;
        hitRegion: string;
        meansOfDeath: number;
      }[];
    };
    player_stats: Record<
      string,
      {
        name: string;
        rounds: string;
        obj_destroyed?: {
          [timestamp: string]: string;
        };
        obj_planted?: {
          [timestamp: string]: string;
        };
        shoves_given?: {
          [timestamp: string]: string;
        };
        distance_travelled_meters?: number;
        distance_travelled_spawn?: number;
        class_switches?: {
          timestamp: number;
          toClass: GameClass;
          fromClass?: GameClass;
        }[];
        weaponStats: string[];
        stance_stats_seconds?: {
          in_prone: number;
          in_crouch: number;
          in_lean: number;
          in_mg: number;
          in_binoculars: number;
        };
        team: string;
        guid: string;
      }
    >;
  };
};

export type RawPlayerStats = GroupRound["round_data"]["player_stats"][string];

export type Player = {
  id: string;
  nick: string;
};

export type GroupDetails = {
  match: {
    match_id: string;
    channel_id: string | null;
    channel_name: string | null;
    state: "waiting_report" | "finished" | "cancelled";
    size: number;
    alpha_team: Player[];
    beta_team: Player[];
    ranks_start: Record<string, number> | null;
    ranks_end: Record<string, number> | null;
    start_time: number;
    end_time: number;
    maps: string[];
    server: {
      ip: string;
      port: number;
      pw: string | null;
      instance: string;
    };
    winner: Team | null;
    rounds: GroupRound[];
  };
};

export type PlayerInfoDict = Record<string, PlayerInfo>;

export type PlayerInfo = {
  guid: string;
  discord_id: string;
  discord_nick: string;
  date_added: string;
};

export type GameClass =
  | "medic"
  | "fieldop"
  | "engineer"
  | "soldier"
  | "covertops";
