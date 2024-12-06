import deepEqual from "deep-equal";

export function byWeaponIds(a: WeaponStats, b: WeaponStats) {
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

export type WeaponStats = {
  hits: number;
  shots: number;
  kills: number;
  deaths: number;
  headshots: number | null;
  name: string;
  acc: number | null;
};

export function convertWeaponStats(raw: string[]) {
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

      const stats: WeaponStats = {
        name,
        hits,
        kills,
        shots,
        deaths,
        headshots,
        acc,
      };

      return stats;
    },
  };
}

export function convertSecondRoundWeaponStats(
  first: string[],
  second: string[],
) {
  const firstRoundStats = convertWeaponStats(first);
  const aggregate = convertWeaponStats(second);

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

export function aggregateWeaponStats(stats: Array<WeaponStats[]>) {
  const aggregatedStats: WeaponStats[] = [];

  for (const round of stats) {
    for (let i = 0; i < round.length; i += 1) {
      const current = round[i];
      const previousIdx = aggregatedStats.findIndex(
        (prev) => prev.name === current.name,
      );

      const previous = aggregatedStats[previousIdx];

      if (!previous) {
        aggregatedStats.push(current);
      } else {
        const name = current.name;
        const hits = current.hits + previous.hits;
        const kills = current.kills + previous.kills;
        const shots = current.shots + previous.shots;
        const deaths = current.deaths + previous.deaths;
        const headshots =
          previous.headshots !== null
            ? current.headshots !== null
              ? current.headshots - previous.headshots
              : previous.headshots
            : null;
        const acc = shots ? hits / shots : null;

        const newEntry: WeaponStats = {
          name,
          hits,
          kills,
          shots,
          deaths,
          headshots,
          acc,
        };

        aggregatedStats[previousIdx] = newEntry;
      }
    }
  }

  return aggregatedStats.toSorted(byWeaponIds);
}

export type StatsAggregate = {
  kills: number;
  deaths: number;
  acc: number;
  headshots: number;
  shots: number;
  hits: number;
};

export function getStatsAggregate(stats: WeaponStats[] | WeaponStats[][]) {
  return stats
    .flatMap((k) => k)
    .reduce(
      (aggregate, ws, idx, arr) => {
        const isLast = idx === arr.length - 1;

        if (ws.headshots) {
          aggregate.headshots += ws.headshots;
        }

        aggregate.deaths += ws.deaths;
        aggregate.kills += ws.kills;
        aggregate.hits += ws.hits;
        aggregate.shots += ws.shots;

        if (isLast) {
          aggregate.acc = aggregate.hits / aggregate.shots;
        }

        return aggregate;
      },
      {
        acc: 0,
        kills: 0,
        deaths: 0,
        headshots: 0,
        shots: 0,
        hits: 0,
      } satisfies StatsAggregate,
    );
}
