import urlJoin from "url-join";

const BASE_URL = "https://api.etl.lol/api/v2/stats/etl";

type PaginatedResponse<T> = {
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
    const data = await getJson<PlayerInfo[]>(url, {
      headers: {
        authorization: `Bearer ${apiToken}`,
      },
    });
    return data;
  },
  async fetchGroups() {
    const url = urlJoin(BASE_URL, "/matches/groups?page=1&page_size=50");
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
};

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
      config: string;
      winnerteam: number;
    };
    player_stats: Record<
      string,
      {
        name: string;
        rounds: string;
        weaponStats: string[];
        team: string;
        guid: string;
      }
    >;
  };
};

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
