import { getColoredParts } from "./colors";
import {
  getDeaths,
  getEfficiency,
  getHeadshots,
  getKdr,
  getKills,
  getRevives,
  type Stats,
} from "./stats";

export const SortKey = {
  Name: "name",
  Effiency: "eff",
  CustomRating: "utro",
  Kdr: "kdr",
  Kills: "kills",
  Deaths: "deaths",
  DamageGiven: "dmg g",
  DamageReceived: "dmg r",
  Headshots: "hs",
  Gibs: "gibs",
  Selfkills: "sk",
  Revives: "rev",
  TimePlayed: "tmp",
} as const;

export const SortDirection = {
  Asc: "asc",
  Desc: "desc",
} as const;

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];
export type SortKey = (typeof SortKey)[keyof typeof SortKey];

export const playersByKeyAndDir =
  (sortKey: SortKey, dir: SortDirection) => (a: Stats, b: Stats) => {
    const dirVal = dir === SortDirection.Asc ? 1 : -1;
    switch (sortKey) {
      case SortKey.Kdr: {
        return (getKdr(a) - getKdr(b)) * dirVal;
      }

      case SortKey.Name: {
        const aName = getColoredParts(a.name)
          .map((s) => s.text)
          .join("");
        const bName = getColoredParts(b.name)
          .map((s) => s.text)
          .join("");
        return aName.localeCompare(bName) * dirVal;
      }

      case SortKey.CustomRating: {
        return (a.metaStats.customRating - b.metaStats.customRating) * dirVal;
      }

      case SortKey.Gibs: {
        return (a.playerStats.gibs - b.playerStats.gibs) * dirVal;
      }

      case SortKey.Kills: {
        return (getKills(a) - getKills(b)) * dirVal;
      }

      case SortKey.Deaths: {
        return (getDeaths(a) - getDeaths(b)) * dirVal;
      }

      case SortKey.Revives: {
        return (getRevives(a) - getRevives(b)) * dirVal;
      }

      case SortKey.Effiency: {
        return (getEfficiency(a) - getEfficiency(b)) * dirVal;
      }

      case SortKey.Headshots: {
        return (getHeadshots(a) - getHeadshots(b)) * dirVal;
      }

      case SortKey.Selfkills: {
        return (a.playerStats.selfKills - b.playerStats.selfKills) * dirVal;
      }

      case SortKey.TimePlayed: {
        return (a.playerStats.playtime - b.playerStats.playtime) * dirVal;
      }

      case SortKey.DamageGiven: {
        return (a.playerStats.damageGiven - b.playerStats.damageGiven) * dirVal;
      }

      case SortKey.DamageReceived: {
        return (
          (a.playerStats.damageReceived - b.playerStats.damageReceived) * dirVal
        );
      }
    }
  };

export function getColumnDescription(key: SortKey) {
  switch (key) {
    case SortKey.CustomRating: {
      return "Unified Tactical Rating Overview";
    }

    case SortKey.Kdr: {
      return "Kills / Deaths";
    }

    case SortKey.Effiency: {
      return "Efficiency (kills / (deaths + selfKills)) * 100";
    }

    case SortKey.DamageGiven: {
      return "Damage given";
    }

    case SortKey.DamageReceived: {
      return "Damage received";
    }

    case SortKey.Selfkills: {
      return "Selfkills";
    }

    case SortKey.Revives: {
      return "Revives";
    }

    case SortKey.TimePlayed: {
      return "Time played";
    }

    case SortKey.Gibs: {
      return "Gibs";
    }

    case SortKey.Headshots: {
      return "Headshots";
    }

    case SortKey.Kills: {
      return "Kills";
    }

    case SortKey.Deaths: {
      return "Deaths";
    }

    default:
      return null;
  }
}
