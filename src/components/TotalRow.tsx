import {
  getDeaths,
  getEfficiency,
  getHeadshots,
  getKdr,
  getKills,
  getRevives,
  type Stats,
} from "../util/stats";
import { createMemo, type Component } from "solid-js";
import clsx from "clsx";

export type TotalRowProps = {
  stats: Stats[];
};

export const TotalRow: Component<TotalRowProps> = (props) => {
  const kdr = createMemo(() => {
    const items = props.stats.map(getKdr);
    const total = items.reduce((acc, value) => acc + value, 0);
    return total / items.length;
  });

  const damageGiven = createMemo(() => {
    const totalDamage = props.stats.reduce(
      (total, player) => total + player.playerStats.damageGiven,
      0,
    );
    return totalDamage;
  });

  const damageReceived = createMemo(() => {
    const totalDamage = props.stats.reduce(
      (total, player) => total + player.playerStats.damageReceived,
      0,
    );
    return totalDamage;
  });

  const kills = createMemo(() => {
    const totalKills = props.stats.reduce(
      (total, player) => total + getKills(player),
      0,
    );
    return totalKills;
  });

  const deaths = createMemo(() => {
    const totalDeaths = props.stats.reduce(
      (total, player) => total + getDeaths(player),
      0,
    );
    return totalDeaths;
  });

  const headshots = createMemo(() => {
    const totalHeadshots = props.stats.reduce(
      (total, player) => total + getHeadshots(player),
      0,
    );
    return totalHeadshots;
  });

  const gibs = createMemo(() => {
    const totalGibs = props.stats.reduce(
      (total, player) => total + player.playerStats.gibs,
      0,
    );
    return totalGibs;
  });

  const selfKills = createMemo(() => {
    const totalSelfkills = props.stats.reduce(
      (total, player) => total + player.playerStats.selfKills,
      0,
    );
    return totalSelfkills;
  });

  const revives = createMemo(() => {
    const totalRevives = props.stats.reduce(
      (total, player) => total + getRevives(player),
      0,
    );
    return totalRevives;
  });

  const timePlayed = createMemo(() => {
    const totalTimeplayed = props.stats.reduce(
      (total, player) => total + player.playerStats.playtime,
      0,
    );
    return totalTimeplayed / props.stats.length;
  });

  const eff = createMemo(() => {
    const totalEff = props.stats.reduce(
      (total, player) => total + getEfficiency(player),
      0,
    );
    return totalEff / props.stats.length;
  });

  return (
    <div class="grid grid-cols-stats items-center gap-4 py-1 px-4 border-t-mud-500 border-t">
      <div class="flex items-center gap-1 justify-start pl-[2px]">
        <div class="flex items-center" />
      </div>
      <div class="text-right">{eff().toFixed(0)}</div>
      <div
        class={clsx(
          "text-right",
          kdr() > 1 ? "text-green-700" : "text-red-700",
        )}
      >
        {kdr().toFixed(2)}
      </div>
      <div class="text-right">{kills()}</div>
      <div class="text-right">{deaths()}</div>
      <div
        class={clsx(
          "text-right",
          damageGiven() > damageReceived() ? "text-green-700" : "text-red-700",
        )}
      >
        {damageGiven()}
      </div>
      <div class="text-right">{damageReceived()}</div>
      <div class="text-right">{headshots()}</div>
      <div class="text-right">{gibs()}</div>
      <div class="text-right">{selfKills()}</div>
      <div class="text-right">{revives()}</div>
      <div class="text-right">{timePlayed().toFixed(0)}</div>
    </div>
  );
};
