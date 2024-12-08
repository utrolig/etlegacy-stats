import { getKdr, type Stats } from "./stats";

export const SortKey = {
  name: "name",
  kdr: "kdr",
} as const;

export const SortDirection = {
  asc: "asc",
  desc: "desc",
};

export type SortDirection = keyof typeof SortDirection;
export type SortKey = keyof typeof SortKey;

export const playersByKeyAndDir =
  (sortKey: SortKey, dir: SortDirection) => (a: Stats, b: Stats) => {
    switch (sortKey) {
      case SortKey.kdr: {
        return (getKdr(a) - getKdr(b)) * (dir === SortDirection.asc ? 1 : -1);
      }
      // case TableRowSortKey.Accuracy: {
      //   return (getAccuracy(a) - getAccuracy(b)) * (dir === "asc" ? 1 : -1);
      // }
      //
      // case TableRowSortKey.Add: {
      //   return (getAdd(a) - getAdd(b)) * (dir === "asc" ? 1 : -1);
      // }
      //
      // case TableRowSortKey.DamageDone: {
      //   return (
      //     (a.categories.damagegiven - b.categories.damagegiven) *
      //     (dir === "asc" ? 1 : -1)
      //   );
      // }
      //
      // case TableRowSortKey.DamageReceived: {
      //   return (
      //     (a.categories.damagereceived - b.categories.damagereceived) *
      //     (dir === "asc" ? 1 : -1)
      //   );
      // }
      //
      // case TableRowSortKey.Deaths: {
      //   return (
      //     (a.categories.deaths - b.categories.deaths) * (dir === "asc" ? 1 : -1)
      //   );
      // }
      //
      // case TableRowSortKey.Gibs: {
      //   return (
      //     (a.categories.gibs - b.categories.gibs) * (dir === "asc" ? 1 : -1)
      //   );
      // }
      //
      // case TableRowSortKey.Headshots: {
      //   return (
      //     (a.categories.headshots - b.categories.headshots) *
      //     (dir === "asc" ? 1 : -1)
      //   );
      // }
      //
      // case TableRowSortKey.Kills: {
      //   return (
      //     (a.categories.kills - b.categories.kills) * (dir === "asc" ? 1 : -1)
      //   );
      // }
      //
      // case TableRowSortKey.Kdr: {
      //   return (getKdr(a) - getKdr(b)) * (dir === "asc" ? 1 : -1);
      // }
      //
      // case TableRowSortKey.Revives: {
      //   return (
      //     (a.categories.revives - b.categories.revives) *
      //     (dir === "asc" ? 1 : -1)
      //   );
      // }
      //
      // case TableRowSortKey.Name: {
      //   return a.alias.localeCompare(b.alias) * (dir === "asc" ? 1 : -1);
      // }
    }
  };
