import type { Group, GroupRound } from "./stats-api";
import {
  aggregateWeaponStats,
  convertPlayerStats,
  convertWeaponStats,
  getWeaponStatsAggregate,
  type PlayerStats,
  type WeaponStatsAggregate,
  type WeaponStats,
  getPlayerStatsAggregate,
} from "./weaponStats";

export function getMatchSize(match: Group) {
  const teamPlayerCount = match.size / 2;
  return teamPlayerCount + "vs" + teamPlayerCount;
}

export type Team = "alpha" | "beta";
export type TeamList = Record<Team, string[]>;

export type Player = {
  id: string;
  name: string;
  weaponStats: WeaponStats[];
  weaponStatsAggregate: WeaponStatsAggregate;
  playerStats: PlayerStats[];
  playerStatsAggregate: PlayerStats;

  team: "alpha" | "beta";
};

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

export function getTeams(rounds: GroupRound[]): TeamList {
  const [firstRound] = rounds;
  const teams = Object.values(firstRound.round_data.player_stats).reduce(
    (acc, playerStats) => {
      const team = getTeam(playerStats.team);
      if (acc[team]) {
        acc[team].push(playerStats.guid);
      } else {
        acc[team] = [playerStats.guid];
      }

      return acc;
    },
    {} as TeamList,
  );

  return teams;
}

export function getTeamStats(rounds: GroupRound[], team: string[]): Player[] {
  const players = rounds.reduce(
    (acc, round, idx, allRounds) => {
      const rounds = Object.values(round.round_data.player_stats);
      for (let i = 0; i < rounds.length; i += 1) {
        const roundData = rounds[i];
        if (!team.includes(roundData.guid)) {
          continue;
        }

        const prev = acc[roundData.guid];
        const firstRoundStats = roundData.weaponStats;
        const isSecondRound = round.round_data.round_info.round === 2;

        const prevRound = allRounds[idx - 1];
        const prevRoundData = prevRound
          ? Object.values(allRounds[idx - 1]?.round_data?.player_stats).find(
              (s) => s.guid === roundData.guid,
            )
          : undefined;

        const secondRoundStats = isSecondRound
          ? prevRoundData?.weaponStats
          : undefined;

        if (prev) {
          prev.weaponStats.push(
            convertWeaponStats(firstRoundStats, secondRoundStats),
          );
          prev.playerStats.push(
            convertPlayerStats(firstRoundStats, secondRoundStats),
          );
        } else {
          acc[roundData.guid] = {
            playerStats: [
              convertPlayerStats(firstRoundStats, secondRoundStats),
            ],
            weaponStats: [
              convertWeaponStats(firstRoundStats, secondRoundStats),
            ],
            id: roundData.guid,
            name: roundData.name,
            team: getTeam(roundData.team),
          };
        }
      }

      return acc;
    },
    {} as Record<
      string,
      Omit<
        Player,
        "weaponStats" | "weaponStatsAggregate" | "playerStatsAggregate"
      > & {
        weaponStats: WeaponStats[][];
      }
    >,
  );

  return Object.values(players).map((p) => {
    const player = p as unknown as Player;
    player.weaponStats = aggregateWeaponStats(p.weaponStats);
    player.weaponStatsAggregate = getWeaponStatsAggregate(player.weaponStats);
    player.playerStatsAggregate = getPlayerStatsAggregate(player.playerStats);
    return player;
  });
}
