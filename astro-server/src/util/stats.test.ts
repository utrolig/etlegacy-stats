import { describe, expect, it } from "vitest";
import type { GroupDetails } from "./stats-api";
import { getMapStats, getMatchStats, getMessages } from "./stats";

function createWeaponStats({
  mask,
  hits,
  shots,
  kills,
  deaths,
  headshots,
  damageGiven,
  damageReceived,
  playtime,
  xp,
}: {
  mask: number;
  hits: number;
  shots: number;
  kills: number;
  deaths: number;
  headshots: number;
  damageGiven: number;
  damageReceived: number;
  playtime: number;
  xp: number;
}) {
  return [
    String(mask),
    String(hits),
    String(shots),
    String(kills),
    String(deaths),
    String(headshots),
    String(damageGiven),
    String(damageReceived),
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    String(playtime),
    String(xp),
  ];
}

function createPlayerStatsWithoutWeapons({
  damageGiven,
  damageReceived,
  playtime,
  xp,
}: {
  damageGiven: number;
  damageReceived: number;
  playtime: number;
  xp: number;
}) {
  return [
    "0",
    String(damageGiven),
    String(damageReceived),
    "0",
    "0",
    "0",
    "0",
    "0",
    "0",
    String(playtime),
    String(xp),
  ];
}

const ALPHA_LONG = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
const BETA_LONG = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
const ALPHA_TEAMMATE_LONG = "CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC";

const legacyFixture: GroupDetails = {
  match: {
    match_id: "legacy-1",
    channel_id: null,
    channel_name: "legacy",
    state: "finished",
    size: 6,
    alpha_team: [{ id: "1", nick: "Alpha" }],
    beta_team: [{ id: "2", nick: "Beta" }],
    ranks_start: null,
    ranks_end: null,
    start_time: 1000,
    end_time: 1100,
    maps: ["supply"],
    server: {
      ip: "127.0.0.1",
      port: 27960,
      pw: null,
      instance: "test",
    },
    winner: "alpha",
    rounds: [
      {
        round_filename: "legacy-round-1",
        round_data: {
          round_info: {
            defenderteam: 1,
            servername: "Legacy Server",
            matchID: "legacy-match",
            round: 1,
            nextTimeLimit: "8:00",
            timelimit: "10:00",
            mapname: "supply",
            config: "test",
            winnerteam: 1,
            messages: [
              {
                command: "say",
                guid: "AAAAAAAA",
                message: "hi",
                timestamp: 1,
              },
              {
                command: "say_team",
                guid: "BBBBBBBB",
                message: "team",
                timestamp: 2,
              },
            ],
            damageStats: [],
            obituaries: [
              {
                timestamp: 3,
                attacker: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                target: "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
                meansOfDeath: 0,
                attackerRespawnTime: 10,
                victimRespawnTime: 12,
              },
            ],
          },
          player_stats: {
            AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA: {
              guid: "AAAAAAAA",
              name: "Alpha",
              rounds: "1",
              team: "1",
              weaponStats: createWeaponStats({
                mask: 1,
                hits: 2,
                shots: 4,
                kills: 1,
                deaths: 0,
                headshots: 0,
                damageGiven: 100,
                damageReceived: 50,
                playtime: 90,
                xp: 10,
              }),
              class_switches: [{ timestamp: 1, toClass: "medic" }],
              stance_stats_seconds: {
                in_prone: 1,
                in_crouch: 2,
                in_lean: 3,
                in_mg: 4,
                in_binoculars: 5,
              },
            },
            BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB: {
              guid: "BBBBBBBB",
              name: "Beta",
              rounds: "1",
              team: "2",
              weaponStats: createWeaponStats({
                mask: 1,
                hits: 1,
                shots: 3,
                kills: 0,
                deaths: 1,
                headshots: 0,
                damageGiven: 50,
                damageReceived: 100,
                playtime: 90,
                xp: 8,
              }),
              class_switches: [{ timestamp: 1, toClass: "engineer" }],
              stance_stats_seconds: {
                in_prone: 2,
                in_crouch: 3,
                in_lean: 4,
                in_mg: 5,
                in_binoculars: 6,
              },
            },
          },
        },
      },
    ],
  },
};

describe("getMatchStats", () => {
  it("supports the legacy ingress format", () => {
    const match = getMatchStats(legacyFixture);

    expect(match.maps).toEqual(["supply"]);
    expect(match.rounds).toHaveLength(1);
    expect(getMessages("", [], match)).toHaveLength(2);
    expect(match.rounds[0]?.stats[0]?.metaStats.classesPlayed).toEqual(["medic"]);
    expect(match.rounds[0]?.stats[0]?.metaStats.secondsSpentInBinoculars).toBe(5);
  });

  it("adds legacy per-weapon damage with GUID normalization and fallback capping", () => {
    const legacyDamageFixture = {
      match: {
        ...legacyFixture.match,
        rounds: [
          {
            ...legacyFixture.match.rounds[0]!,
            round_data: {
              ...legacyFixture.match.rounds[0]!.round_data,
              round_info: {
                ...legacyFixture.match.rounds[0]!.round_data.round_info,
                damageStats: [
                  {
                    attacker: ALPHA_LONG,
                    target: BETA_LONG,
                    damageFlags: 64,
                    damage: 160,
                    timestamp: 1,
                    hitRegion: "HR_NONE",
                    meansOfDeath: 8,
                  },
                  {
                    attacker: ALPHA_LONG,
                    target: ALPHA_LONG,
                    damageFlags: 64,
                    damage: 50,
                    timestamp: 2,
                    hitRegion: "HR_NONE",
                    meansOfDeath: 8,
                  },
                ],
              },
              player_stats: {
                [ALPHA_LONG]: {
                  ...legacyFixture.match.rounds[0]!.round_data.player_stats[
                    ALPHA_LONG
                  ]!,
                  guid: "AAAAAAAA",
                },
                [BETA_LONG]: {
                  ...legacyFixture.match.rounds[0]!.round_data.player_stats[
                    BETA_LONG
                  ]!,
                  guid: "BBBBBBBB",
                },
              } as (typeof legacyFixture.match.rounds)[number]["round_data"]["player_stats"],
            } as (typeof legacyFixture.match.rounds)[number]["round_data"],
          },
        ],
      },
    } as GroupDetails;

    const match = getMatchStats(legacyDamageFixture);
    const alphaStats = match.rounds[0]!.stats.find((stats) => stats.id === "AAAAAAAA");
    const mp40Stats = alphaStats?.weaponStats.find((weapon) => weapon.name === "MP 40");

    expect(mp40Stats?.damage).toBe(140);
    expect(mp40Stats?.kills).toBe(0);
    expect(mp40Stats?.shots).toBe(0);
  });

  it("adds new per-weapon damage, filters invalid events, and aggregates across rounds", () => {
    const newFixture: GroupDetails = {
      match: {
        match_id: "new-1",
        channel_id: null,
        channel_name: "new",
        state: "finished",
        size: 9,
        alpha_team: [
          { id: "1", nick: "Alpha" },
          { id: "3", nick: "Teammate" },
        ],
        beta_team: [{ id: "2", nick: "Beta" }],
        ranks_start: null,
        ranks_end: null,
        start_time: 1000,
        end_time: 1100,
        maps: ["supply", "radar"],
        server: {
          ip: "127.0.0.1",
          port: 27960,
          pw: null,
          instance: "test",
        },
        winner: "alpha",
        rounds: [
          {
            round_filename: "new-round-1",
            round_data: {
              round_info: {
                servername: "New Server",
                config: "test",
                mapname: "supply",
                round: 1,
                matchID: "new-match",
                defenderteam: 1,
                winnerteam: 1,
                timelimit: "10:00",
                nextTimeLimit: "8:00",
                stats_version: "1",
                mod_version: "1",
                et_version: "1",
                server_ip: "127.0.0.1",
                server_port: "27960",
                round_start: 0,
                round_end: 1000,
                round_start_unix: 1000,
                round_end_unix: 1010,
                original_match_id: "new-match",
              },
              gamelog: [
                {
                  group: "player",
                  label: "damage",
                  killer: ALPHA_LONG,
                  victim: BETA_LONG,
                  damage: 50,
                  damage_flags: 64,
                  weapon: 9,
                  hit_region: "HR_NONE",
                  killer_health: 140,
                  killer_class: "medic",
                  killer_pos: "0 0 0",
                  killer_stance: {
                    is_prone: false,
                    is_crouch: false,
                    is_mounted: false,
                    is_leaning: false,
                    is_carrying_obj: false,
                    is_disguised: false,
                    is_downed: false,
                    is_sprint: false,
                  },
                  victim_health: 40,
                  victim_class: "engineer",
                  victim_pos: "1 1 1",
                  victim_stance: {
                    is_prone: false,
                    is_crouch: false,
                    is_mounted: false,
                    is_leaning: false,
                    is_carrying_obj: false,
                    is_disguised: false,
                    is_downed: false,
                    is_sprint: false,
                  },
                  match_id: "new-match",
                  round_id: 1,
                  unixtime: 1,
                  leveltime: 1,
                },
                {
                  group: "player",
                  label: "damage",
                  killer: ALPHA_LONG,
                  victim: ALPHA_TEAMMATE_LONG,
                  damage: 30,
                  damage_flags: 64,
                  weapon: 9,
                  hit_region: "HR_NONE",
                  victim_health: 30,
                  victim_stance: {
                    is_prone: false,
                    is_crouch: false,
                    is_mounted: false,
                    is_leaning: false,
                    is_carrying_obj: false,
                    is_disguised: false,
                    is_downed: false,
                    is_sprint: false,
                  },
                  match_id: "new-match",
                  round_id: 1,
                  unixtime: 2,
                  leveltime: 2,
                },
                {
                  group: "player",
                  label: "damage",
                  killer: ALPHA_LONG,
                  victim: ALPHA_LONG,
                  damage: 30,
                  damage_flags: 64,
                  weapon: 9,
                  hit_region: "HR_NONE",
                  victim_health: 30,
                  victim_stance: {
                    is_prone: false,
                    is_crouch: false,
                    is_mounted: false,
                    is_leaning: false,
                    is_carrying_obj: false,
                    is_disguised: false,
                    is_downed: false,
                    is_sprint: false,
                  },
                  match_id: "new-match",
                  round_id: 1,
                  unixtime: 3,
                  leveltime: 3,
                },
                {
                  group: "player",
                  label: "damage",
                  killer: "WORLD",
                  victim: BETA_LONG,
                  damage: 30,
                  damage_flags: 64,
                  weapon: 9,
                  hit_region: "HR_NONE",
                  victim_health: 30,
                  victim_stance: {
                    is_prone: false,
                    is_crouch: false,
                    is_mounted: false,
                    is_leaning: false,
                    is_carrying_obj: false,
                    is_disguised: false,
                    is_downed: false,
                    is_sprint: false,
                  },
                  match_id: "new-match",
                  round_id: 1,
                  unixtime: 4,
                  leveltime: 4,
                },
                {
                  group: "player",
                  label: "damage",
                  killer: ALPHA_LONG,
                  victim: BETA_LONG,
                  damage: 30,
                  damage_flags: 64,
                  weapon: 9,
                  hit_region: "HR_NONE",
                  victim_health: 0,
                  victim_stance: {
                    is_prone: false,
                    is_crouch: false,
                    is_mounted: false,
                    is_leaning: false,
                    is_carrying_obj: false,
                    is_disguised: false,
                    is_downed: false,
                    is_sprint: false,
                  },
                  match_id: "new-match",
                  round_id: 1,
                  unixtime: 5,
                  leveltime: 5,
                },
                {
                  group: "player",
                  label: "damage",
                  killer: ALPHA_LONG,
                  victim: BETA_LONG,
                  damage: 30,
                  damage_flags: 64,
                  weapon: 9,
                  hit_region: "HR_NONE",
                  victim_health: 30,
                  victim_stance: {
                    is_prone: false,
                    is_crouch: false,
                    is_mounted: false,
                    is_leaning: false,
                    is_carrying_obj: false,
                    is_disguised: false,
                    is_downed: true,
                    is_sprint: false,
                  },
                  match_id: "new-match",
                  round_id: 1,
                  unixtime: 6,
                  leveltime: 6,
                },
                {
                  group: "player",
                  label: "damage",
                  killer: ALPHA_LONG,
                  damage: 30,
                  damage_flags: 64,
                  weapon: 9,
                  hit_region: "HR_NONE",
                  match_id: "new-match",
                  round_id: 1,
                  unixtime: 7,
                  leveltime: 7,
                },
              ],
              player_stats: {
                [ALPHA_LONG]: {
                  guid: "AAAAAAAA",
                  name: "Alpha",
                  rounds: "1",
                  team: "1",
                  weaponStats: createPlayerStatsWithoutWeapons({
                    damageGiven: 40,
                    damageReceived: 0,
                    playtime: 90,
                    xp: 10,
                  }),
                  stance_stats_seconds: {
                    in_prone: 0,
                    in_crouch: 0,
                    in_mg: 0,
                    in_lean: 0,
                    in_objcarrier: 0,
                    in_vehiclescort: 0,
                    in_disguise: 0,
                    in_sprint: 0,
                    in_turtle: 0,
                    is_downed: 0,
                  },
                },
                [ALPHA_TEAMMATE_LONG]: {
                  guid: "CCCCCCCC",
                  name: "Teammate",
                  rounds: "1",
                  team: "1",
                  weaponStats: createPlayerStatsWithoutWeapons({
                    damageGiven: 0,
                    damageReceived: 0,
                    playtime: 90,
                    xp: 5,
                  }),
                  stance_stats_seconds: {
                    in_prone: 0,
                    in_crouch: 0,
                    in_mg: 0,
                    in_lean: 0,
                    in_objcarrier: 0,
                    in_vehiclescort: 0,
                    in_disguise: 0,
                    in_sprint: 0,
                    in_turtle: 0,
                    is_downed: 0,
                  },
                },
                [BETA_LONG]: {
                  guid: "BBBBBBBB",
                  name: "Beta",
                  rounds: "1",
                  team: "2",
                  weaponStats: createPlayerStatsWithoutWeapons({
                    damageGiven: 0,
                    damageReceived: 40,
                    playtime: 90,
                    xp: 8,
                  }),
                  stance_stats_seconds: {
                    in_prone: 0,
                    in_crouch: 0,
                    in_mg: 0,
                    in_lean: 0,
                    in_objcarrier: 0,
                    in_vehiclescort: 0,
                    in_disguise: 0,
                    in_sprint: 0,
                    in_turtle: 0,
                    is_downed: 0,
                  },
                },
              },
            },
          },
          {
            round_filename: "new-round-2",
            round_data: {
              round_info: {
                servername: "New Server",
                config: "test",
                mapname: "radar",
                round: 1,
                matchID: "new-match",
                defenderteam: 1,
                winnerteam: 1,
                timelimit: "10:00",
                nextTimeLimit: "8:00",
                stats_version: "1",
                mod_version: "1",
                et_version: "1",
                server_ip: "127.0.0.1",
                server_port: "27960",
                round_start: 0,
                round_end: 1000,
                round_start_unix: 1000,
                round_end_unix: 1010,
                original_match_id: "new-match",
              },
              gamelog: [
                {
                  group: "player",
                  label: "damage",
                  killer: ALPHA_LONG,
                  victim: BETA_LONG,
                  damage: 20,
                  damage_flags: 64,
                  weapon: 9,
                  hit_region: "HR_NONE",
                  victim_health: 30,
                  victim_stance: {
                    is_prone: false,
                    is_crouch: false,
                    is_mounted: false,
                    is_leaning: false,
                    is_carrying_obj: false,
                    is_disguised: false,
                    is_downed: false,
                    is_sprint: false,
                  },
                  match_id: "new-match",
                  round_id: 1,
                  unixtime: 8,
                  leveltime: 8,
                },
              ],
              player_stats: {
                [ALPHA_LONG]: {
                  guid: "AAAAAAAA",
                  name: "Alpha",
                  rounds: "1",
                  team: "1",
                  weaponStats: createPlayerStatsWithoutWeapons({
                    damageGiven: 20,
                    damageReceived: 0,
                    playtime: 90,
                    xp: 10,
                  }),
                  stance_stats_seconds: {
                    in_prone: 0,
                    in_crouch: 0,
                    in_mg: 0,
                    in_lean: 0,
                    in_objcarrier: 0,
                    in_vehiclescort: 0,
                    in_disguise: 0,
                    in_sprint: 0,
                    in_turtle: 0,
                    is_downed: 0,
                  },
                },
                [ALPHA_TEAMMATE_LONG]: {
                  guid: "CCCCCCCC",
                  name: "Teammate",
                  rounds: "1",
                  team: "1",
                  weaponStats: createPlayerStatsWithoutWeapons({
                    damageGiven: 0,
                    damageReceived: 0,
                    playtime: 90,
                    xp: 5,
                  }),
                  stance_stats_seconds: {
                    in_prone: 0,
                    in_crouch: 0,
                    in_mg: 0,
                    in_lean: 0,
                    in_objcarrier: 0,
                    in_vehiclescort: 0,
                    in_disguise: 0,
                    in_sprint: 0,
                    in_turtle: 0,
                    is_downed: 0,
                  },
                },
                [BETA_LONG]: {
                  guid: "BBBBBBBB",
                  name: "Beta",
                  rounds: "1",
                  team: "2",
                  weaponStats: createPlayerStatsWithoutWeapons({
                    damageGiven: 0,
                    damageReceived: 20,
                    playtime: 90,
                    xp: 8,
                  }),
                  stance_stats_seconds: {
                    in_prone: 0,
                    in_crouch: 0,
                    in_mg: 0,
                    in_lean: 0,
                    in_objcarrier: 0,
                    in_vehiclescort: 0,
                    in_disguise: 0,
                    in_sprint: 0,
                    in_turtle: 0,
                    is_downed: 0,
                  },
                },
              },
            },
          },
        ],
      },
    };

    const match = getMatchStats(newFixture);
    const alphaRoundOne = match.rounds[0]!.stats.find((stats) => stats.id === "AAAAAAAA");
    const thompsonRoundOne = alphaRoundOne?.weaponStats.find(
      (weapon) => weapon.name === "Thompson",
    );
    const aggregatedAlpha = getMapStats("", [], match).find(
      (stats) => stats.id === "AAAAAAAA",
    );
    const aggregatedThompson = aggregatedAlpha?.weaponStats.find(
      (weapon) => weapon.name === "Thompson",
    );

    expect(thompsonRoundOne?.damage).toBe(40);
    expect(aggregatedThompson?.damage).toBe(60);
    expect(aggregatedThompson?.kills).toBe(0);
  });

  it("computes duration-weighted playtime average across rounds", () => {
    // Two independent round-1 rounds on different maps with different durations.
    // round:2 triggers cumulative-delta maths, so we use round:1 for both.
    const unequalDurationFixture: GroupDetails = {
      match: {
        match_id: "weighted-1",
        channel_id: null,
        channel_name: "weighted",
        state: "finished",
        size: 6,
        alpha_team: [{ id: "1", nick: "Alpha" }],
        beta_team: [],
        ranks_start: null,
        ranks_end: null,
        start_time: 1000,
        end_time: 1100,
        maps: ["supply", "radar"],
        server: { ip: "127.0.0.1", port: 27960, pw: null, instance: "test" },
        winner: "alpha",
        rounds: [
          {
            round_filename: "weighted-round-1",
            round_data: {
              round_info: {
                servername: "Server",
                config: "test",
                mapname: "supply",
                round: 1,
                matchID: "weighted-match",
                defenderteam: 1,
                winnerteam: 1,
                timelimit: "3:00",
                nextTimeLimit: "3:00",
                stats_version: "1",
                mod_version: "1",
                et_version: "1",
                server_ip: "127.0.0.1",
                server_port: "27960",
                round_start: 0,
                round_end: 180,
                round_start_unix: 1000,
                round_end_unix: 1180,
                original_match_id: "weighted-match",
              },
              gamelog: [],
              player_stats: {
                [ALPHA_LONG]: {
                  guid: "AAAAAAAA",
                  name: "Alpha",
                  rounds: "1",
                  team: "1",
                  weaponStats: createPlayerStatsWithoutWeapons({
                    damageGiven: 0,
                    damageReceived: 0,
                    playtime: 100,
                    xp: 0,
                  }),
                  stance_stats_seconds: {
                    in_prone: 0,
                    in_crouch: 0,
                    in_mg: 0,
                    in_lean: 0,
                    in_objcarrier: 0,
                    in_vehiclescort: 0,
                    in_disguise: 0,
                    in_sprint: 0,
                    in_turtle: 0,
                    is_downed: 0,
                  },
                },
              },
            },
          },
          {
            round_filename: "weighted-round-2",
            round_data: {
              round_info: {
                servername: "Server",
                config: "test",
                mapname: "radar",
                round: 1,
                matchID: "weighted-match",
                defenderteam: 1,
                winnerteam: 1,
                timelimit: "7:00",
                nextTimeLimit: "7:00",
                stats_version: "1",
                mod_version: "1",
                et_version: "1",
                server_ip: "127.0.0.1",
                server_port: "27960",
                round_start: 0,
                round_end: 420,
                round_start_unix: 1180,
                round_end_unix: 1600,
                original_match_id: "weighted-match",
              },
              gamelog: [],
              player_stats: {
                [ALPHA_LONG]: {
                  guid: "AAAAAAAA",
                  name: "Alpha",
                  rounds: "1",
                  team: "1",
                  weaponStats: createPlayerStatsWithoutWeapons({
                    damageGiven: 0,
                    damageReceived: 0,
                    playtime: 0,
                    xp: 0,
                  }),
                  stance_stats_seconds: {
                    in_prone: 0,
                    in_crouch: 0,
                    in_mg: 0,
                    in_lean: 0,
                    in_objcarrier: 0,
                    in_vehiclescort: 0,
                    in_disguise: 0,
                    in_sprint: 0,
                    in_turtle: 0,
                    is_downed: 0,
                  },
                },
              },
            },
          },
        ],
      },
    };

    const match = getMatchStats(unequalDurationFixture);
    const aggregated = getMapStats("", [], match).find(
      (stats) => stats.id === "AAAAAAAA",
    );

    // 3-min round at 100% + 7-min round at 0% → (100*3 + 0*7) / 10 = 30
    // Old broken formula: (100 + 0) / 2 = 50
    expect(aggregated?.playerStats.playtime).toBe(30);
  });
});
