import { getColoredNameParts } from "./colors";
import { getRandomBetween } from "./random";
import {
  getDeaths,
  getHeadshots,
  getSpamKills,
  WEAPON_NAMES,
  type Stats,
} from "./stats";

export type Award = {
  name: string;
  values: Array<[number, string]>;
  winner: [number, string];
  type: "weapon" | "silly";
  isPercentage?: boolean;
  valueName: string;
  valueDecimals: number;
  reason: string;
};

export function getWeaponAward(
  weapon: keyof typeof WEAPON_NAMES,
  stats: Stats[],
): Award | null {
  const values = stats
    .reduce(
      (acc, player) => {
        const weaponStats = player.weaponStats.find(
          (wpn) => wpn.name === WEAPON_NAMES[weapon] && wpn.kills > 0,
        );

        if (weaponStats) {
          acc.push([weaponStats.kills, player.name]);
        }

        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!values.length) {
    return null;
  }

  return {
    name: weapon,
    type: "weapon",
    winner: values[0],
    values,
    reason: "for most kills",
    valueDecimals: 0,
    valueName: "Kills",
  };
}

export function getAllWeaponAwards(stats: Stats[]): Award[] {
  return Object.keys(WEAPON_NAMES)
    .map(
      (name) =>
        getWeaponAward(name as keyof typeof WEAPON_NAMES, stats) as Award,
    )
    .filter(Boolean);
}

export function getBaiterAward(stats: Stats[]): Award | null {
  const baiters = stats.reduce(
    (acc, player) => {
      const kazimRegex = new RegExp(/.*k[a]+[z]+[iy]+[mn][em]?.*/gi);
      const ipodRegex = new RegExp(/(littyj|litoriousj|the adjuster)/gi);

      const playerName = getColoredNameParts(player.name)
        .map((s) => s.text)
        .join("");

      const shouldShowBaiter = Math.random() > 0.35;

      if (!shouldShowBaiter) {
        return acc;
      }

      if (
        kazimRegex.test(playerName) ||
        ipodRegex.test(playerName) ||
        playerName.includes("pod")
      ) {
        acc.push([getRandomBetween(85, 97), player.name]);
      }

      return acc;
    },
    [] as Award["values"],
  );

  if (!baiters.length) {
    return null;
  }

  return {
    reason: "for baiting their team",
    valueName: "Time spent baiting",
    valueDecimals: 0,
    isPercentage: true,
    type: "silly",
    name: "Baiter",
    winner: baiters[0],
    values: baiters,
  };
}

export function getMayanAward(stats: Stats[]): Award | null {
  const hasUsedGrenadeLauncherAndHasLessThanFiftyPercentAccuracy = stats
    .reduce(
      (acc, player) => {
        const grenadeLauncher = player.weaponStats.find(
          (wpn) =>
            wpn.name === WEAPON_NAMES["G.Launchr"] &&
            wpn.acc !== null &&
            wpn.acc < 0.5,
        );

        if (grenadeLauncher) {
          acc.push([(grenadeLauncher.acc as number) * 100, player.name]);
        }

        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => a - b);

  if (!hasUsedGrenadeLauncherAndHasLessThanFiftyPercentAccuracy.length) {
    return null;
  }

  return {
    reason: "for having below 50% accuracy with rifle nade",
    valueName: "Riflenade accuracy",
    valueDecimals: 1,
    isPercentage: true,
    type: "silly",
    name: "mayan",
    winner: hasUsedGrenadeLauncherAndHasLessThanFiftyPercentAccuracy[0],
    values: hasUsedGrenadeLauncherAndHasLessThanFiftyPercentAccuracy,
  };
}

export function getHighestPlaytimeAward(stats: Stats[]): Award | null {
  const revives = stats
    .reduce(
      (acc, player) => {
        acc.push([player.playerStats.playtime as number, player.name]);
        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!revives.length) {
    return null;
  }

  return {
    reason: "for having the highest playtime",
    valueName: "Playtime",
    valueDecimals: 0,
    type: "silly",
    name: "playtime",
    isPercentage: true,
    winner: revives[0],
    values: revives,
  };
}

export function getSpectatorAward(stats: Stats[]): Award | null {
  const revives = stats
    .reduce(
      (acc, player) => {
        if (player.playerStats.playtime <= 70) {
          acc.push([
            (100 - player.playerStats.playtime) as number,
            player.name,
          ]);
        }

        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!revives.length) {
    return null;
  }

  return {
    reason: "for spending the most time spectating",
    valueName: "Time spent spectating teammates",
    valueDecimals: 0,
    type: "silly",
    name: "spectator",
    isPercentage: true,
    winner: revives[0],
    values: revives,
  };
}

export function getGibsAward(stats: Stats[]): Award | null {
  const gibs = stats
    .reduce(
      (acc, player) => {
        const gibs = player.playerStats.gibs;
        acc.push([gibs, player.name]);

        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!gibs.length) {
    return null;
  }

  return {
    reason: "for most gibs",
    valueName: "Gibs",
    valueDecimals: 0,
    type: "silly",
    name: "gibber",
    winner: gibs[0],
    values: gibs,
  };
}

export function getHeadshotsAward(stats: Stats[]): Award | null {
  const headshots = stats
    .reduce(
      (acc, player) => {
        const headshots = getHeadshots(player);
        acc.push([headshots, player.name]);

        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!headshots.length) {
    return null;
  }

  return {
    reason: "for most headshots",
    valueName: "Headshots",
    valueDecimals: 0,
    type: "silly",
    name: "ZkuLLCruZh3R",
    winner: headshots[0],
    values: headshots,
  };
}

export function getMostRevivesAward(stats: Stats[]): Award | null {
  const revives = stats
    .reduce(
      (acc, player) => {
        const syringe = player.weaponStats.find(
          (wpn) => wpn.name === WEAPON_NAMES["Syringe"] && wpn.hits > 0,
        );

        if (syringe) {
          acc.push([syringe.hits as number, player.name]);
        }

        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!revives.length) {
    return null;
  }

  return {
    reason: "for most revives",
    valueName: "Revives",
    valueDecimals: 0,
    type: "silly",
    name: "needler",
    winner: revives[0],
    values: revives,
  };
}

export function getIpodAward(stats: Stats[]): Award | null {
  const deaths = stats
    .reduce(
      (acc, player) => {
        const deaths = getDeaths(player);

        acc.push([deaths, player.name]);

        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => a - b);

  if (!deaths.length) {
    return null;
  }

  return {
    reason: "for fewest deaths",
    valueName: "Deaths",
    valueDecimals: 0,
    type: "silly",
    name: "iPod",
    winner: deaths[0],
    values: deaths,
  };
}

export function getSpammerAward(stats: Stats[]): Award | null {
  const spamKills = stats
    .reduce(
      (acc, player) => {
        const spamKills = getSpamKills(player);

        if (spamKills) {
          acc.push([spamKills, player.name]);
        }

        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!spamKills.length) {
    return null;
  }

  return {
    reason: "for most spamkills",
    valueName: "Spam kills",
    valueDecimals: 0,
    type: "silly",
    name: "spammer",
    winner: spamKills[0],
    values: spamKills,
  };
}

export function getAllSillyAwards(stats: Stats[]): Award[] {
  const awards = [
    getHighestPlaytimeAward(stats),
    getMostRevivesAward(stats),
    getGibsAward(stats),
    getMayanAward(stats),
    getBaiterAward(stats),
    getSpectatorAward(stats),
    getHeadshotsAward(stats),
    getSpammerAward(stats),
    getIpodAward(stats),
  ].filter(Boolean) as Award[];
  return awards;
}
