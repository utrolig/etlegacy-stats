import deepEqual from "deep-equal";
import type { GroupDetails, GroupRound } from "./stats-api";

export type WeaponStats = {
  hits: number;
  shots: number;
  kills: number;
  deaths: number;
  headshots: number | null;
  name: string;
  acc: number | null;
};

export type PlayerStats = {
  damageGiven: number;
  damageReceived: number;
  teamDamageGiven: number;
  teamDamageReceived: number;
  gibs: number;
  selfKills: number;
  teamKills: number;
  teamGibs: number;
  playtime: number;
  xp: number;
};

export type Stats = {
  id: string;
  name: string;
  team: Team | null;
  playerStats: PlayerStats;
  weaponStats: WeaponStats[];
};

export type RoundStats = {};

export type MapStats = {
  map: string;
  roundTimes: string[];
  stats: PlayerStats[];
};

function getPlayerTeam(guid: string, teams: TeamList): Team | null {
  if (teams.alpha.find((alphaGuid) => alphaGuid.id === guid)) {
    return "alpha";
  }

  if (teams.beta.find((betaGuid) => betaGuid.id === guid)) {
    return "beta";
  }

  return null;
}

export type MatchStats = {
  maps: string[];
  teams: TeamList;
  score: {
    alpha: number;
    beta: number;
  };
  rounds: {
    map: string;
    roundNumber: number;
    stats: Stats[];
  }[];
};

export function getMapStats(
  map: "all" | (string & {}),
  rounds: number[],
  stats: MatchStats,
): Stats[] {
  const filteredRounds =
    map === "all"
      ? [...stats.rounds]
      : stats.rounds.filter((round) => {
          if (rounds.length) {
            return round.map === map && rounds.includes(round.roundNumber);
          }

          return round.map === map;
        });

  const playersMap = filteredRounds.reduce(
    (acc, roundStats) => {
      roundStats.stats.forEach((roundStat) => {
        const prevEntry = acc[roundStat.id];

        if (prevEntry?.id) {
          acc[roundStat.id] = {
            ...prevEntry,
            playerStats: addPlayerStats(prevEntry, roundStat),
            weaponStats: addWeaponStats(prevEntry, roundStat),
          };
        } else {
          acc[roundStat.id] = roundStat;
        }
      });

      return acc;
    },
    {} as Record<string, Stats>,
  );

  return Object.values(playersMap);
}

function addPlayerStats(
  { playerStats: prev }: Stats,
  { playerStats: toAdd }: Stats,
): PlayerStats {
  return {
    xp: prev.xp + toAdd.xp,
    gibs: prev.gibs + toAdd.gibs,
    playtime: prev.playtime + toAdd.playtime,
    teamGibs: prev.teamGibs + toAdd.teamGibs,
    selfKills: prev.selfKills + toAdd.selfKills,
    teamKills: prev.teamKills + toAdd.teamKills,
    damageGiven: prev.damageGiven + toAdd.damageGiven,
    damageReceived: prev.damageReceived + toAdd.damageReceived,
    teamDamageGiven: prev.teamDamageGiven + toAdd.teamDamageGiven,
    teamDamageReceived: prev.teamDamageReceived + toAdd.teamDamageReceived,
  } satisfies PlayerStats;
}

function addWeaponStats(
  { weaponStats: prev }: Stats,
  { weaponStats: toAdd }: Stats,
): WeaponStats[] {
  const stats = [...prev, ...toAdd].reduce(
    (acc, entry) => {
      const wpn = acc[entry.name];

      if (wpn) {
        const hits = wpn.hits + entry.hits;
        const shots = wpn.shots + entry.shots;
        const kills = wpn.kills + entry.kills;
        const deaths = wpn.deaths + entry.deaths;
        const headshots =
          wpn.headshots !== null && entry.headshots !== null
            ? wpn.headshots + entry.headshots
            : null;
        const accuracy = hits / shots;

        const weaponStats = {
          name: entry.name,
          hits,
          shots,
          kills,
          deaths,
          headshots,
          acc: accuracy,
        } satisfies WeaponStats;

        acc[entry.name] = weaponStats;
      } else {
        acc[entry.name] = entry;
      }

      return acc;
    },
    {} as Record<string, WeaponStats>,
  );

  return Object.values(stats);
}

export function getMatchStats(info: GroupDetails): MatchStats {
  const { match } = info;

  const teams = getTeams(match.rounds);
  const score = match.rounds.reduce(
    (scoreAcc, round) => {
      const { winnerteam } = round.round_data.round_info;
      const players = Object.values(round.round_data.player_stats);

      for (const player of players) {
        if (Number(player.team) === winnerteam) {
          const isAlphaWinner = teams.alpha.some((p) => p.id === player.guid);
          const isBetaWinner = teams.beta.some((p) => p.id === player.guid);

          if (isAlphaWinner) {
            scoreAcc.alpha += 1;
          }

          if (isBetaWinner) {
            scoreAcc.beta += 1;
          }

          break;
        }
      }

      return scoreAcc;
    },
    {
      beta: 0,
      alpha: 0,
    } satisfies MatchStats["score"],
  );

  const rounds = match.rounds.reduce(
    (acc, round, idx, allRounds) => {
      const hasPlayedMapPreviously = allRounds
        .slice(0, idx)
        .filter(
          (s) =>
            s.round_data.round_info.mapname ===
              round.round_data.round_info.mapname &&
            s.round_data.round_info.round === round.round_data.round_info.round,
        );

      const roundsToAdd = hasPlayedMapPreviously.length ? 2 : 0;
      const roundNumber = round.round_data.round_info.round + roundsToAdd;

      acc.push({
        map: round.round_data.round_info.mapname,
        roundNumber,
        stats: Object.values(round.round_data.player_stats).map((ps) => {
          let playerStats = convertPlayerStats(ps.weaponStats);
          let weaponStats = convertWeaponStats(ps.weaponStats);

          if (round.round_data.round_info.round === 2) {
            const prevRound = allRounds[idx - 1];
            const prevRoundRawStats = Object.values(
              prevRound.round_data.player_stats,
            ).find((p) => p.guid === ps.guid)?.weaponStats;

            if (!prevRoundRawStats) {
              throw new Error(
                "Could not find previous round stats for player.",
              );
            }

            playerStats = convertPlayerStats(
              prevRoundRawStats,
              ps.weaponStats,
              prevRound,
              round,
            );
            weaponStats = convertWeaponStats(prevRoundRawStats, ps.weaponStats);
          }

          return {
            id: ps.guid,
            name: ps.name,
            team: getPlayerTeam(ps.guid, teams),
            playerStats,
            weaponStats,
          };
        }),
      });

      return acc;
    },
    [] as {
      map: string;
      roundNumber: number;
      stats: Stats[];
    }[],
  );

  return {
    score,
    maps: match.maps,
    teams,
    rounds,
  };
}

export type Team = "alpha" | "beta";
export type TeamPlayer = {
  id: string;
  name: string;
};
export type TeamList = Record<Team, TeamPlayer[]>;

export function getTeam(team: string): Team {
  switch (team) {
    case "1": {
      return "alpha";
    }
    case "2":
      return "beta";
    case "alpha":
      return "alpha";
    case "beta":
      return "beta";
    default:
      return "alpha";
  }
}

function getTeams(rounds: GroupRound[]): TeamList {
  const [firstRound] = rounds;
  const teams = Object.values(firstRound.round_data.player_stats).reduce(
    (acc, playerStats) => {
      const team = getTeam(playerStats.team);
      if (acc[team]) {
        acc[team].push({ id: playerStats.guid, name: playerStats.name });
      } else {
        acc[team] = [{ id: playerStats.guid, name: playerStats.name }];
      }

      return acc;
    },
    {} as TeamList,
  );

  return teams;
}

function convertFirstRoundPlayerStats(rawStats: string[]): PlayerStats {
  const nums = rawStats.map(Number);
  const numLength = nums.length;

  const damageGiven = nums[numLength - 10] ?? 0;
  const damageReceived = nums[numLength - 9] ?? 0;
  const teamDamageGiven = nums[numLength - 8] ?? 0;
  const teamDamageReceived = nums[numLength - 7] ?? 0;
  const gibs = nums[numLength - 6] ?? 0;
  const selfKills = nums[numLength - 5] ?? 0;
  const teamKills = nums[numLength - 4] ?? 0;
  const teamGibs = nums[numLength - 3] ?? 0;
  const playtime = nums[numLength - 2] ?? 0;
  const xp = nums[numLength - 1] ?? 0;

  return {
    damageGiven,
    damageReceived,
    teamDamageGiven,
    teamDamageReceived,
    gibs,
    selfKills,
    teamKills,
    teamGibs,
    playtime,
    xp,
  };
}

function convertTimeToMinutes(time: string): number {
  const [minutes, seconds] = time.split(":").map(Number);

  const mins = minutes as number;
  const secs = seconds as number;

  return mins + secs / 60;
}

function getSecondRoundPlaytime(
  firstRoundPlaytimePercentage: number,
  totalPlaytimePercentage: number,
  firstRoundDuration: string,
  secondRoundDuration: string,
) {
  const r1Percentage = firstRoundPlaytimePercentage;
  const r1Duration = convertTimeToMinutes(firstRoundDuration);
  const r2Duration = convertTimeToMinutes(secondRoundDuration);
  const totalDuration = r1Duration + r2Duration;
  const totalPercentage = totalPlaytimePercentage;

  const round2Percentage =
    (totalPercentage * totalDuration - r1Percentage * r1Duration) / r2Duration;

  return Math.round(round2Percentage * 100) / 100;
}

function convertSecondRoundPlayerStats(
  first: string[],
  second: string[],
  firstRound: GroupRound,
  secondRound: GroupRound,
): PlayerStats {
  const firstRoundStats = convertFirstRoundPlayerStats(first);
  const aggregate = convertFirstRoundPlayerStats(second);

  const playtime = getSecondRoundPlaytime(
    firstRoundStats.playtime,
    aggregate.playtime,
    firstRound.round_data.round_info.nextTimeLimit,
    secondRound.round_data.round_info.nextTimeLimit,
  );

  return {
    xp: aggregate.xp,
    gibs: aggregate.gibs - firstRoundStats.gibs,
    playtime,
    teamGibs: aggregate.teamGibs - firstRoundStats.teamGibs,
    selfKills: aggregate.selfKills - firstRoundStats.selfKills,
    teamKills: aggregate.teamKills - firstRoundStats.teamKills,
    damageGiven: aggregate.damageGiven - firstRoundStats.damageGiven,
    damageReceived: aggregate.damageReceived - firstRoundStats.damageReceived,
    teamDamageGiven:
      aggregate.teamDamageGiven - firstRoundStats.teamDamageGiven,
    teamDamageReceived:
      aggregate.teamDamageReceived - firstRoundStats.teamDamageReceived,
  };
}

function convertPlayerStats(
  firstRoundRaw: string[],
  secondRoundRaw?: string[],
  firstRound?: GroupRound,
  secondRound?: GroupRound,
) {
  if (!secondRoundRaw) {
    return convertFirstRoundPlayerStats(firstRoundRaw);
  }

  if (!firstRound || !secondRound) {
    throw new Error(
      "You have to pass the rounds when converting second round PlayerStats",
    );
  }

  return convertSecondRoundPlayerStats(
    firstRoundRaw,
    secondRoundRaw,
    firstRound,
    secondRound,
  );
}

function convertFirstRoundWeaponStats(raw: string[]): WeaponStats[] {
  const nums = raw.map(Number);

  if (nums.some((num) => isNaN(num))) {
    throw new Error(`Some number was unparseable. ${nums.join(", ")}`);
  }

  let argIndex = 1;

  const weapons: WeaponStats[] = [];

  for (const k of Object.keys(WEAPON_IDS)) {
    const weaponId = parseInt(k);
    const firstEntry = nums[0];

    if (firstEntry === undefined) {
      throw new Error("Invalid stats");
    }

    if (firstEntry & (1 << weaponId)) {
      const weapon: WeaponStats = {
        hits: nums[argIndex++] as number,
        shots: nums[argIndex++] as number,
        kills: nums[argIndex++] as number,
        deaths: nums[argIndex++] as number,
        headshots: nums[argIndex++] as number,
        name: WEAPON_IDS[weaponId].name as string,
        acc: 0,
      };

      if (!WEAPON_IDS[weaponId].hasHeadshots) {
        weapon.headshots = null;
      }

      weapon.acc = weapon.shots ? weapon.hits / weapon.shots : null;

      weapons.push(weapon);
    }
  }

  return weapons;
}

function removePrevious(previous: WeaponStats) {
  return {
    from(current: WeaponStats) {
      let stats: WeaponStats = current;
      if (current.name !== "Knife" && current.name !== "Ka-Bar") {
        const name = current.name;
        const hits = current.hits - previous.hits;
        const kills = current.kills - previous.kills;
        const shots = current.shots - previous.shots;
        const deaths = current.deaths - previous.deaths;
        const headshots =
          previous.headshots !== null
            ? current.headshots !== null
              ? current.headshots - previous.headshots
              : null
            : null;
        const acc = shots ? hits / shots : null;
        stats = {
          name,
          hits,
          kills,
          shots,
          deaths,
          headshots,
          acc,
        };
      }

      return stats;
    },
  };
}

function convertSecondRoundWeaponStats(first: string[], second: string[]) {
  const firstRoundStats = convertFirstRoundWeaponStats(first);
  const aggregate = convertFirstRoundWeaponStats(second);

  const secondRoundStats: WeaponStats[] = [];

  for (const weapon of aggregate) {
    const previousEntry = firstRoundStats.find(
      (prev) => prev.name === weapon.name,
    );

    if (!previousEntry) {
      secondRoundStats.push(weapon);
      continue;
    }

    if (deepEqual(previousEntry, weapon)) {
      continue;
    }

    const stats = removePrevious(previousEntry).from(weapon);

    secondRoundStats.push(stats);
  }

  return secondRoundStats;
}

function convertWeaponStats(
  firstRoundRaw: string[],
  secondRoundRaw?: string[],
) {
  if (!secondRoundRaw) {
    return convertFirstRoundWeaponStats(firstRoundRaw);
  }

  return convertSecondRoundWeaponStats(firstRoundRaw, secondRoundRaw);
}

export function sortByWeaponIds(a: WeaponStats, b: WeaponStats) {
  return (
    WEAPON_NAMES[a.name as keyof typeof WEAPON_NAMES] -
    WEAPON_NAMES[b.name as keyof typeof WEAPON_NAMES]
  );
}

export const WEAPON_IDS: Record<
  number,
  { name: string; hasHeadshots: boolean }
> = {
  0: { name: "Knife", hasHeadshots: false },
  1: { name: "Ka-Bar", hasHeadshots: false },
  2: { name: "Luger", hasHeadshots: true },
  3: {
    name: "Colt",
    hasHeadshots: true,
  },
  4: {
    name: "MP 40",
    hasHeadshots: true,
  },
  5: {
    name: "Thompson",
    hasHeadshots: true,
  },
  6: {
    name: "Sten",
    hasHeadshots: true,
  },
  7: {
    name: "FG 42",
    hasHeadshots: true,
  },
  8: {
    name: "Panzer",
    hasHeadshots: false,
  },
  9: {
    name: "Bazooka",
    hasHeadshots: false,
  },
  10: {
    name: "F.Thrower",
    hasHeadshots: false,
  },
  11: {
    name: "Grenade",
    hasHeadshots: false,
  },
  12: {
    name: "Mortar",
    hasHeadshots: false,
  },
  13: {
    name: "Granatwerf",
    hasHeadshots: false,
  },
  14: {
    name: "Dynamite",
    hasHeadshots: false,
  },
  15: {
    name: "Airstrike",
    hasHeadshots: false,
  },
  16: {
    name: "Artillery",
    hasHeadshots: false,
  },
  17: {
    name: "Satchel",
    hasHeadshots: false,
  },
  18: {
    name: "G.Launchr",
    hasHeadshots: false,
  },
  19: {
    name: "Landmine",
    hasHeadshots: false,
  },
  20: {
    name: "MG 42 Gun",
    hasHeadshots: false,
  },
  21: {
    name: "Browning",
    hasHeadshots: false,
  },
  22: {
    name: "Garand",
    hasHeadshots: true,
  },
  23: {
    name: "K43 Rifle",
    hasHeadshots: true,
  },
  24: {
    name: "Scp.Garand",
    hasHeadshots: true,
  },
  25: {
    name: "Scp.K43",
    hasHeadshots: true,
  },
  26: {
    name: "MP 34",
    hasHeadshots: true,
  },
  27: { name: "Syringe", hasHeadshots: false },
} as const;

export const WEAPON_NAMES = {
  Knife: 0,
  "Ka-Bar": 1,
  Luger: 2,
  Colt: 3,
  "MP 40": 4,
  Thompson: 5,
  Sten: 6,
  "FG 42": 7,
  Panzer: 8,
  Bazooka: 9,
  "F.Thrower": 10,
  Grenade: 11,
  Mortar: 12,
  Granatwerf: 13,
  Dynamite: 14,
  Airstrike: 15,
  Artillery: 16,
  Satchel: 17,
  "G.Launchr": 18,
  Landmine: 19,
  "MG 42 Gun": 20,
  Browning: 21,
  Garand: 22,
  "K43 Rifle": 23,
  "Scp.Garand": 24,
  "Scp.K43": 25,
  "MP 34": 26,
  Syringe: 27,
} as const;

export function getKills(stats: Stats) {
  return stats.weaponStats.reduce((kills, entry) => kills + entry.kills, 0);
}

export function getDeaths(stats: Stats) {
  return stats.weaponStats.reduce((deaths, entry) => deaths + entry.deaths, 0);
}

export function getKdr(stats: Stats) {
  const kills = getKills(stats);
  const deaths = getDeaths(stats);

  return kills / deaths;
}

export function getAverageDamageGivenPerDeath(stats: Stats) {
  const deaths = getDeaths(stats);
  return stats.playerStats.damageGiven / deaths;
}

export function getAverageDamageTakenPerDeath(stats: Stats) {
  const deaths = getDeaths(stats);
  return stats.playerStats.damageReceived / deaths;
}

export function getRevives(stats: Stats) {
  return stats.weaponStats
    .filter((wpn) => wpn.name === "Syringe")
    .reduce((revives, entry) => revives + entry.hits, 0);
}

export function getHeadshots(stats: Stats) {
  return stats.weaponStats.reduce(
    (headshots, entry) => (entry.headshots ?? 0) + headshots,
    0,
  );
}

export function getAccuracy(stats: Stats) {
  const shots = stats.weaponStats.reduce(
    (shots, entry) => entry.shots + shots,
    0,
  );
  const hits = stats.weaponStats.reduce((hits, entry) => entry.hits + hits, 0);

  return (hits / shots) * 100;
}

export function getEfficiency(stats: Stats) {
  const kills = getKills(stats);
  const deaths = getDeaths(stats);
  const { selfKills } = stats.playerStats;
  return (kills / (deaths + selfKills)) * 100;
}
