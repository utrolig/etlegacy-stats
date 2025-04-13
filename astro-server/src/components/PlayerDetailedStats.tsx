import { createMemo, For, type Component } from "solid-js";
import {
  byWeaponIds,
  getAccuracy,
  getDeaths,
  getHeadshotPercentage,
  getKills,
  WEAPON_NAMES,
  type Stats,
} from "../util/stats";
import { getWeaponIcons } from "../util/weaponIcons";

export type PlayerDetailedStatsProps = {
  stats: Stats;
};

export const PlayerDetailedStats: Component<PlayerDetailedStatsProps> = (
  props,
) => {
  const sortedWeaponStats = createMemo(() => {
    return props.stats.weaponStats.toSorted(byWeaponIds);
  });

  return (
    <div class="flex flex-col pt-4 px-9 pb-6 gap-8">
      <div class="flex flex-col">
        <div class="grid grid-cols-weaponStats items-center gap-2 text-xs font-semibold text-mud-300 py-1">
          <p class="pl-10">Weapon</p>
          <p class="text-right">Accuracy</p>
          <p class="text-right">Hits / Shots</p>
          <p class="text-right">Kills</p>
          <p class="text-right">Deaths</p>
          <p class="text-right">Headshots</p>
          <p class="text-right">HS%</p>
        </div>
        <div class="flex flex-col">
          <For each={sortedWeaponStats()}>
            {(weapon) => (
              <div class="grid grid-cols-weaponStats items-center gap-2 text-sm py-[2px]">
                <div class="flex items-center gap-4">
                  <img
                    class="w-8 h-4"
                    src={
                      getWeaponIcons(weapon.name as keyof typeof WEAPON_NAMES)
                        .src
                    }
                  />
                  {weapon.name}
                </div>
                <p class="text-right">{formatAccuracy(weapon.acc)}</p>
                <p class="text-right">
                  {formatHitsShots(weapon.hits, weapon.shots)}
                </p>
                <p class="text-right">{weapon.kills}</p>
                <p class="text-right">{weapon.deaths}</p>
                <p class="text-right">{formatHeadshots(weapon.headshots)}</p>
                <p class="text-right">
                  {formatHeadshotPercentage(weapon.hits, weapon.headshots)}
                </p>
              </div>
            )}
          </For>
        </div>
      </div>
      <div class="flex text-sm">
        <div class="flex flex-col">
          <div class="grid gap-2 grid-cols-[120px,80px] items-center">
            <p>Damage given:</p>
            <p>{props.stats.playerStats.damageGiven}</p>
          </div>

          <div class="grid gap-2 grid-cols-[120px,80px] items-center">
            <p>Damage received:</p>
            <p>{props.stats.playerStats.damageReceived}</p>
          </div>
        </div>

        <div class="flex flex-col">
          <div class="grid gap-2 grid-cols-[160px,80px] items-center">
            <p>Team Damage given:</p>
            <p>{props.stats.playerStats.teamDamageGiven}</p>
          </div>

          <div class="grid gap-2 grid-cols-[160px,80px] items-center">
            <p>Team Damage received:</p>
            <p>{props.stats.playerStats.teamDamageReceived}</p>
          </div>
        </div>
      </div>

      <div class="flex text-sm">
        <div class="flex flex-col">
          <div class="grid gap-2 grid-cols-[120px,80px] items-center">
            <p>Kills:</p>
            <p>{getKills(props.stats)}</p>
          </div>

          <div class="grid gap-2 grid-cols-[120px,80px] items-center">
            <p>Deaths:</p>
            <p>{getDeaths(props.stats)}</p>
          </div>

          <div class="grid gap-2 grid-cols-[120px,80px] items-center">
            <p>Gibs:</p>
            <p>{props.stats.playerStats.gibs}</p>
          </div>
        </div>

        <div class="flex flex-col">
          <div class="grid gap-2 grid-cols-[160px,80px] items-center">
            <p>Team kills:</p>
            <p>{props.stats.playerStats.teamKills}</p>
          </div>

          <div class="grid gap-2 grid-cols-[160px,80px] items-center">
            <p>Self kills:</p>
            <p>{props.stats.playerStats.selfKills}</p>
          </div>

          <div class="grid gap-2 grid-cols-[160px,80px] items-center">
            <p>Team gibs:</p>
            <p>{props.stats.playerStats.teamGibs}</p>
          </div>
        </div>

        <div class="flex flex-col">
          <div class="grid gap-2 grid-cols-[160px,80px] items-center">
            <p>Accuracy:</p>
            <p>{formatTotalAccuracy(props.stats)}</p>
          </div>

          <div class="grid gap-2 grid-cols-[160px,80px] items-center">
            <p>Headshots:</p>
            <p>{formatTotalHeadshotPercentage(props.stats)}</p>
          </div>

          <div class="grid gap-2 grid-cols-[160px,80px] items-center">
            <p>Playtime:</p>
            <p>{formatPlaytime(props.stats.playerStats.playtime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatTotalAccuracy(stats: Stats) {
  const accuracy = getAccuracy(stats);
  return (
    <>
      {accuracy.toFixed(1)}
      <span class="text-mud-300">%</span>
    </>
  );
}

function formatTotalHeadshotPercentage(stats: Stats) {
  const percentage = getHeadshotPercentage(stats);

  return (
    <>
      {(percentage * 100).toFixed(1)}
      <span class="text-mud-300">%</span>
    </>
  );
}

function formatPlaytime(playtime: number) {
  return (
    <>
      {playtime.toFixed(1)}
      <span class="text-mud-300">%</span>
    </>
  );
}

function formatHitsShots(hits: number, shots: number) {
  return (
    <>
      {hits}
      <span class="text-mud-300">/</span>
      {shots}
    </>
  );
}

function formatAccuracy(accuracy: number | null) {
  if (!accuracy) {
    return null;
  }

  return (
    <>
      {(accuracy * 100).toFixed(1)}
      <span class="text-mud-300">%</span>
    </>
  );
}

function formatHeadshotPercentage(hits: number, headshots: number | null) {
  if (!headshots) {
    return null;
  }
  return (
    <>
      {((headshots / hits) * 100).toFixed(1)}
      <span class="text-mud-300">%</span>
    </>
  );
}

function formatHeadshots(headshots: number | null) {
  if (!headshots) {
    return null;
  }

  return headshots;
}
