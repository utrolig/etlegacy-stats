import urlJoin from 'url-join'

const BASE_URL = 'https://api.oksii.lol/api/v2/stats/etl'

export const statsApi = {
  async fetchGroups() {
    const url = urlJoin(BASE_URL, '/matches/groups')
    const data = await getJson<Group[]>(url)
    return data
  },
  async fetchGroupDetails(groupId: number) {
    const url = urlJoin(BASE_URL, '/matches/groups', groupId.toString())
    const data = await getJson<GroupDetails>(url)
    return data
  },
}

async function getJson<T>(...args: Parameters<typeof fetch>) {
  const response = await fetch(...args)

  if (!response.ok) {
    // eslint-disable-next-line no-console
    console.error('jsonFetch error', response)
    throw new Error(response.statusText)
  }

  return response.json() as Promise<T>
}

export type Team = 'alpha' | 'beta'

export type Group = {
  match_id: number
  channel_name: string
  state: 'waiting_report' | 'finished' | 'cancelled' | 'unknown match'
  size: number
  start_time: number
  end_time: number
  maps: string[]
  alpha_team: string[]
  beta_team: string[]
  server: {
    ip: string
    port: number
    pw: string
    instance: string
  }
  winner: Team
}

export type GroupRound = {
  round_filename: string
  round_data: {
    round_info: {
      defenderteam: number
      servername: string
      matchID: string
      round: number
      nextTimeLimit: string
      timelimit: string
      mapname: string
      config: string
      winnerteam: number
    }
    player_stats: Record<
      string,
      {
        name: string
        rounds: string
        weaponStats: string[]
        team: string
        guid: string
      }
    >
  }
}

export type Player = {
  id: string
  nick: string
}

export type GroupDetails = {
  match: {
    match_id: number
    channel_id: string | null
    channel_name: string | null
    state: 'waiting_report' | 'finished' | 'cancelled'
    size: number
    alpha_team: Player[]
    beta_team: Player[]
    ranks_start: Record<string, number> | null
    ranks_end: Record<string, number> | null
    start_time: number
    end_time: number
    maps: string[]
    server: {
      ip: string
      port: number
      pw: string | null
      instance: string
    }
    winner: Team | null
    rounds: GroupRound[]
  }
}
