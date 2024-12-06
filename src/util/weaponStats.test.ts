import { describe, it, assert } from "vitest";
import {
  aggregateWeaponStats,
  byWeaponIds,
  convertSecondRoundWeaponStats,
  convertWeaponStats,
  getStatsAggregate,
  StatsAggregate,
  WEAPON_IDS,
  WEAPON_NAMES,
} from "./weaponStats";

function generateTestData(
  weaponInfo: {
    name: string;
    hits: number;
    shots: number;
    headshots: number;
    kills: number;
    deaths: number;
  }[],
) {
  return weaponInfo
    .map((w) => {
      const hasHeadshots =
        WEAPON_IDS[WEAPON_NAMES[w.name as keyof typeof WEAPON_NAMES]]
          .hasHeadshots;
      const headshots = hasHeadshots ? w.headshots : null;
      const acc = w.shots ? w.hits / w.shots : null;

      return {
        hits: w.hits,
        shots: w.shots,
        kills: w.kills,
        deaths: w.deaths,
        name: w.name,
        headshots,
        acc,
      };
    })
    .toSorted(byWeaponIds);
}

describe("weaponStats", () => {
  it("should correctly convert stats", () => {
    const input = [
      "10750497",
      "0",
      "5",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "4",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "6",
      "10",
      "0",
      "0",
      "0",
      "11",
      "15",
      "8",
      "0",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "26",
      "66",
      "7",
      "0",
      "0",
      "1983",
      "819",
      "54",
      "46",
      "9",
      "4",
      "0",
      "0",
      "76.5",
      "53",
    ];

    const testData = generateTestData([
      {
        name: "Knife",
        hits: 0,
        shots: 5,
        kills: 0,
        deaths: 0,
        headshots: 0,
      },
      {
        name: "Thompson",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 4,
        headshots: 0,
      },
      {
        name: "Bazooka",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 1,
        headshots: 0,
      },
      {
        name: "Grenade",
        hits: 6,
        shots: 10,
        kills: 0,
        deaths: 0,
        headshots: 0,
      },
      {
        name: "G.Launchr",
        hits: 11,
        shots: 15,
        kills: 8,
        deaths: 0,
        headshots: 0,
      },
      {
        name: "Browning",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 1,
        headshots: 0,
      },
      {
        name: "K43 Rifle",
        hits: 26,
        shots: 66,
        kills: 7,
        deaths: 0,
        headshots: 0,
      },
    ]);

    const stats = convertWeaponStats(input);
    assert.deepEqual(stats, testData);
  });

  it("should correctly convert stats", () => {
    const input = [
      "14944821",
      "0",
      "5",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "0",
      "0",
      "0",
      "3",
      "0",
      "0",
      "0",
      "0",
      "4",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "6",
      "10",
      "0",
      "0",
      "0",
      "15",
      "24",
      "9",
      "0",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "17",
      "35",
      "3",
      "0",
      "1",
      "26",
      "66",
      "7",
      "0",
      "0",
      "2837",
      "1423",
      "54",
      "64",
      "9",
      "7",
      "0",
      "0",
      "74.4",
      "18",
    ];

    const testData = generateTestData([
      {
        name: "Knife",
        hits: 0,
        shots: 5,
        kills: 0,
        deaths: 0,
        headshots: 0,
      },
      {
        name: "Luger",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 1,
        headshots: 0,
      },
      {
        name: "MP 40",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 3,
        headshots: 0,
      },
      {
        name: "Thompson",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 4,
        headshots: 0,
      },
      {
        name: "Bazooka",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 1,
        headshots: 0,
      },
      {
        name: "Grenade",
        hits: 6,
        shots: 10,
        kills: 0,
        deaths: 0,
        headshots: 0,
      },
      {
        name: "G.Launchr",
        hits: 15,
        shots: 24,
        kills: 9,
        deaths: 0,
        headshots: 0,
      },
      {
        name: "Browning",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 1,
        headshots: 0,
      },
      {
        name: "Garand",
        hits: 17,
        shots: 35,
        kills: 3,
        deaths: 0,
        headshots: 1,
      },
      {
        name: "K43 Rifle",
        hits: 26,
        shots: 66,
        kills: 7,
        deaths: 0,
        headshots: 0,
      },
    ]);

    const stats = convertWeaponStats(input);
    assert.deepEqual(stats, testData);
  });

  it("should correctly remove round 1 from round 2", () => {
    const roundOneInput = [
      "10750497",
      "0",
      "5",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "4",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "6",
      "10",
      "0",
      "0",
      "0",
      "11",
      "15",
      "8",
      "0",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "26",
      "66",
      "7",
      "0",
      "0",
      "1983",
      "819",
      "54",
      "46",
      "9",
      "4",
      "0",
      "0",
      "76.5",
      "53",
    ];

    const roundTwoInput = [
      "14944821",
      "0",
      "5",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "0",
      "0",
      "0",
      "3",
      "0",
      "0",
      "0",
      "0",
      "4",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "6",
      "10",
      "0",
      "0",
      "0",
      "15",
      "24",
      "9",
      "0",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "17",
      "35",
      "3",
      "0",
      "1",
      "26",
      "66",
      "7",
      "0",
      "0",
      "2837",
      "1423",
      "54",
      "64",
      "9",
      "7",
      "0",
      "0",
      "74.4",
      "18",
    ];

    const roundTwoStats = convertSecondRoundWeaponStats(
      roundOneInput,
      roundTwoInput,
    );

    const expected = generateTestData([
      {
        deaths: 1,
        headshots: 0,
        hits: 0,
        kills: 0,
        name: "Luger",
        shots: 0,
      },
      {
        name: "MP 40",
        deaths: 3,
        hits: 0,
        kills: 0,
        shots: 0,
        headshots: 0,
      },
      {
        name: "G.Launchr",
        headshots: 0,
        deaths: 0,
        shots: 9,
        hits: 4,
        kills: 1,
      },
      {
        name: "Garand",
        headshots: 1,
        hits: 17,
        kills: 3,
        shots: 35,
        deaths: 0,
      },
    ]);

    assert.deepEqual(roundTwoStats, expected);
  });

  it("should aggregate stats correctly", () => {
    const roundOneInput = [
      "10750497",
      "0",
      "5",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "4",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "6",
      "10",
      "0",
      "0",
      "0",
      "11",
      "15",
      "8",
      "0",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "26",
      "66",
      "7",
      "0",
      "0",
      "1983",
      "819",
      "54",
      "46",
      "9",
      "4",
      "0",
      "0",
      "76.5",
      "53",
    ];

    const roundTwoInput = [
      "14944821",
      "0",
      "5",
      "0",
      "0",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "0",
      "0",
      "0",
      "3",
      "0",
      "0",
      "0",
      "0",
      "4",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "6",
      "10",
      "0",
      "0",
      "0",
      "15",
      "24",
      "9",
      "0",
      "0",
      "0",
      "0",
      "0",
      "1",
      "0",
      "17",
      "35",
      "3",
      "0",
      "1",
      "26",
      "66",
      "7",
      "0",
      "0",
      "2837",
      "1423",
      "54",
      "64",
      "9",
      "7",
      "0",
      "0",
      "74.4",
      "18",
    ];

    const roundOneStats = convertWeaponStats(roundOneInput);
    const roundTwoStats = convertSecondRoundWeaponStats(
      roundOneInput,
      roundTwoInput,
    );

    const aggregate = aggregateWeaponStats([roundOneStats, roundTwoStats]);

    const testData = generateTestData([
      {
        name: "Knife",
        deaths: 0,
        kills: 0,
        hits: 0,
        shots: 5,
        headshots: 0,
      },
      {
        name: "Thompson",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 4,
        headshots: 0,
      },
      {
        name: "Bazooka",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 1,
        headshots: 0,
      },
      {
        name: "Grenade",
        hits: 6,
        shots: 10,
        kills: 0,
        deaths: 0,
        headshots: 0,
      },
      {
        name: "G.Launchr",
        hits: 15,
        shots: 24,
        kills: 9,
        deaths: 0,
        headshots: 0,
      },
      {
        name: "Browning",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 1,
        headshots: 0,
      },
      {
        name: "K43 Rifle",
        hits: 26,
        shots: 66,
        kills: 7,
        deaths: 0,
        headshots: 0,
      },
      {
        name: "Luger",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 1,
        headshots: 0,
      },
      {
        name: "MP 40",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 3,
        headshots: 0,
      },
      {
        name: "Garand",
        hits: 17,
        shots: 35,
        kills: 3,
        deaths: 0,
        headshots: 1,
      },
    ]);

    assert.deepEqual(aggregate, testData);
  });

  it("should aggregate weaponStats correctly", () => {
    const testData = generateTestData([
      {
        name: "Knife",
        deaths: 0,
        kills: 0,
        hits: 0,
        shots: 5,
        headshots: 0,
      },
      {
        name: "Thompson",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 4,
        headshots: 0,
      },
      {
        name: "Bazooka",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 1,
        headshots: 0,
      },
      {
        name: "Grenade",
        hits: 6,
        shots: 10,
        kills: 0,
        deaths: 0,
        headshots: 0,
      },
      {
        name: "G.Launchr",
        hits: 15,
        shots: 24,
        kills: 9,
        deaths: 0,
        headshots: 0,
      },
      {
        name: "Browning",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 1,
        headshots: 0,
      },
      {
        name: "K43 Rifle",
        hits: 26,
        shots: 66,
        kills: 7,
        deaths: 0,
        headshots: 0,
      },
      {
        name: "Luger",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 1,
        headshots: 0,
      },
      {
        name: "MP 40",
        hits: 0,
        shots: 0,
        kills: 0,
        deaths: 3,
        headshots: 0,
      },
      {
        name: "Garand",
        hits: 17,
        shots: 35,
        kills: 3,
        deaths: 0,
        headshots: 1,
      },
    ]);

    const expected = {
      hits: 64,
      acc: 0.45714285714285713,
      kills: 19,
      deaths: 10,
      headshots: 1,
      shots: 140,
    } satisfies StatsAggregate;

    assert.deepEqual(getStatsAggregate(testData), expected);
  });
});
