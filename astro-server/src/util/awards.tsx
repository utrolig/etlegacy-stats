import { getColoredParts } from "./colors";
import { formatTime } from "./formatTime";
import { createSeededRandom, getRandomBetween } from "./random";
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
  suffix?: string;
  valueName: string;
  valueDecimals: number;
  reason: string;
  formatValue?: (value: number) => string;
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

export function getBaiterAward(stats: Stats[], roundId: string): Award | null {
  const random = createSeededRandom(roundId);
  const baiters = stats
    .reduce(
      (acc, player) => {
        const kazimRegex = new RegExp(/.*k[a]+[z]+[iy]+[mn][em]?.*/gi);
        const ipodRegex = new RegExp(/(littyj|litoriousj|the adjuster)/gi);
        const bltzzRegex = new RegExp(/(bltzz)/gi);
        const fireballRegex = new RegExp(
          /[fph][i1!][r][e3][b8][a4@][l1!][l1!]/i,
        );
        const bladeRegex = new RegExp(/[b8][l1!][a4@][d][e3]/i);

        const playerName = getColoredParts(player.name)
          .map((s) => s.text)
          .join("");

        const randVal = random();
        const shouldShowBaiter = randVal > 0.35;

        if (!shouldShowBaiter) {
          return acc;
        }

        if (
          kazimRegex.test(playerName) ||
          ipodRegex.test(playerName) ||
          bltzzRegex.test(playerName) ||
          fireballRegex.test(playerName) ||
          bladeRegex.test(playerName) ||
          playerName.includes("pod")
        ) {
          acc.push([getRandomBetween(60, 97, random), player.name]);
        }

        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!baiters.length) {
    return null;
  }

  return {
    reason: "for baiting their team",
    valueName: "Time spent baiting",
    valueDecimals: 0,
    suffix: "%",
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
    suffix: "%",
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
    suffix: "%",
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
    suffix: "%",
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

export function getMarathonRunnerAward(stats: Stats[]): Award | null {
  const distances = stats
    .reduce(
      (acc, player) => {
        const distance = player.metaStats.distanceTravelledMeters;
        acc.push([distance, player.name]);
        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!distances.length || distances.every(([distance]) => distance === 0)) {
    return null;
  }

  return {
    reason: "for longest distance travelled",
    valueName: "Distance travelled",
    valueDecimals: 0,
    type: "silly",
    name: "Dauwalter",
    suffix: "m",
    winner: distances[0],
    values: distances,
  };
}

export function getComaAward(stats: Stats[]): Award | null {
  const distances = stats
    .reduce(
      (acc, player) => {
        const distance = player.metaStats.distanceTravelledSpawnAvg;
        acc.push([distance, player.name]);
        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => a - b);

  if (!distances.length || distances.every(([distance]) => distance === 0)) {
    return null;
  }

  return {
    reason: "for least distance travelled on average 3 seconds after spawning",
    valueName: "Distance travelled",
    valueDecimals: 0,
    type: "silly",
    name: "coma",
    suffix: "m",
    winner: distances[0],
    values: distances,
  };
}

export function getCroucherAward(stats: Stats[]): Award | null {
  const crouchTimes = stats
    .reduce(
      (acc, player) => {
        if (player.metaStats.secondsSpentCrouching > 0) {
          acc.push([player.metaStats.secondsSpentCrouching, player.name]);
        }
        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!crouchTimes.length || crouchTimes.every(([time]) => time === 0)) {
    return null;
  }

  return {
    reason: "for most time spent crouching",
    name: "croucher",
    type: "silly",
    valueDecimals: 0,
    valueName: "Seconds spent crouching",
    values: crouchTimes,
    winner: crouchTimes[0],
    formatValue: formatTime,
  };
}

export function getLeanerAward(stats: Stats[]): Award | null {
  const leanTimes = stats
    .reduce(
      (acc, player) => {
        if (player.metaStats.secondsSpentLeaning > 0) {
          acc.push([player.metaStats.secondsSpentLeaning, player.name]);
        }
        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!leanTimes.length || leanTimes.every(([time]) => time === 0)) {
    return null;
  }

  return {
    reason: "for most time spent leaning",
    name: "purple drank",
    type: "silly",
    valueDecimals: 0,
    valueName: "Time spent leaning",
    values: leanTimes,
    winner: leanTimes[0],
    formatValue: formatTime,
  };
}

export function getMgAward(stats: Stats[]): Award | null {
  const mgTimes = stats
    .reduce(
      (acc, player) => {
        if (player.metaStats.secondsSpentInMg > 0) {
          acc.push([player.metaStats.secondsSpentInMg, player.name]);
        }
        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!mgTimes.length || mgTimes.every(([time]) => time === 0)) {
    return null;
  }

  return {
    reason: "for most time spent in MG",
    name: "MG",
    type: "silly",
    valueDecimals: 0,
    valueName: "Time spent in MG",
    values: mgTimes,
    winner: mgTimes[0],
    formatValue: formatTime,
  };
}

export function getProneAward(stats: Stats[]): Award | null {
  const proneTimes = stats
    .reduce(
      (acc, player) => {
        if (player.metaStats.secondsSpentProne > 0) {
          acc.push([player.metaStats.secondsSpentProne, player.name]);
        }
        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (!proneTimes.length || proneTimes.every(([time]) => time === 0)) {
    return null;
  }

  return {
    reason: "for most time spent proning",
    name: "prone",
    type: "silly",
    valueDecimals: 0,
    valueName: "Time spent proning",
    values: proneTimes,
    winner: proneTimes[0],
    formatValue: formatTime,
  };
}

export function getBinocularsAward(stats: Stats[]): Award | null {
  const binocularsTimes = stats
    .reduce(
      (acc, player) => {
        if (player.metaStats.secondsSpentInBinoculars > 0) {
          acc.push([player.metaStats.secondsSpentInBinoculars, player.name]);
        }
        return acc;
      },
      [] as Award["values"],
    )
    .sort(([a], [b]) => b - a);

  if (
    !binocularsTimes.length ||
    binocularsTimes.every(([time]) => time === 0)
  ) {
    return null;
  }

  return {
    reason: "for most time spent looking through binoculars",
    name: "binoculars",
    type: "silly",
    valueDecimals: 0,
    valueName: "Time spent looking through binoculars",
    values: binocularsTimes,
    winner: binocularsTimes[0],
    formatValue: formatTime,
  };
}

export function getAllSillyAwards(stats: Stats[], roundId: string): Award[] {
  const awards = [
    getHighestPlaytimeAward(stats),
    getMostRevivesAward(stats),
    getGibsAward(stats),
    getMayanAward(stats),
    getBaiterAward(stats, roundId),
    getSpectatorAward(stats),
    getHeadshotsAward(stats),
    getSpammerAward(stats),
    getIpodAward(stats),
    getMarathonRunnerAward(stats),
    getComaAward(stats),
    getLeanerAward(stats),
    getCroucherAward(stats),
    getMgAward(stats),
    getProneAward(stats),
    getBinocularsAward(stats),
  ].filter(Boolean) as Award[];
  return awards;
}
