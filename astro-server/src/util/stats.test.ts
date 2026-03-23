import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { GroupDetails } from "./stats-api";
import { getMatchStats, getMessages } from "./stats";

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

const newFixture = JSON.parse(
  readFileSync(path.resolve(process.cwd(), "new-stats-example.json"), "utf8"),
) as GroupDetails;

describe("getMatchStats", () => {
  it("supports the legacy ingress format", () => {
    const match = getMatchStats(legacyFixture);

    expect(match.maps).toEqual(["supply"]);
    expect(match.rounds).toHaveLength(1);
    expect(getMessages("", [], match)).toHaveLength(2);
    expect(match.rounds[0]?.stats[0]?.metaStats.classesPlayed).toEqual(["medic"]);
    expect(match.rounds[0]?.stats[0]?.metaStats.secondsSpentInBinoculars).toBe(5);
  });

  it("supports the new ingress format via gamelog normalization", () => {
    const match = getMatchStats(newFixture);
    const rawMessageCount = newFixture.match.rounds.reduce((count, round) => {
      const gamelog = "gamelog" in round.round_data ? round.round_data.gamelog : [];
      return (
        count +
        (gamelog?.filter(
          (event) => event.group === "player" && event.label === "message",
        ).length ?? 0)
      );
    }, 0);

    expect(match.rounds).toHaveLength(newFixture.match.rounds.length);
    expect(getMessages("", [], match)).toHaveLength(rawMessageCount);
    expect(match.rounds.every((round) => round.messages.length >= 0)).toBe(true);
    expect(
      match.rounds.every((round) =>
        round.stats.every((stats) => Number.isFinite(stats.metaStats.customRating)),
      ),
    ).toBe(true);
    expect(
      match.rounds.some((round) =>
        round.stats.some((stats) => stats.metaStats.classesPlayed.length > 0),
      ),
    ).toBe(true);
  });
});
