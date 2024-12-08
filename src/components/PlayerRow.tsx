import { createMemo, For, type Component } from "solid-js";
import {
  getDeaths,
  getEfficiency,
  getHeadshots,
  getKdr,
  getKills,
  getRevives,
  type Stats,
} from "../util/stats";
import { getColoredNameParts } from "../util/colors";
import clsx from "clsx";
import { PlayerDetailedStats } from "./PlayerDetailedStats";
import { Collapsible } from "@kobalte/core/collapsible";

export type PlayerRowProps = {
  stats: Stats;
};

export const PlayerRow: Component<PlayerRowProps> = (props) => {
  const kdr = createMemo(() => {
    return getKdr(props.stats);
  });

  return (
    <Collapsible class="flex flex-col odd:bg-white/5">
      <Collapsible.Trigger class="grid grid-cols-stats items-center gap-4  p-2 px-4">
        <div class="flex justify-start pl-5">
          <For each={getColoredNameParts(props.stats.name)}>
            {({ color, text }) => <span style={{ color }}>{text}</span>}
          </For>
        </div>
        <div class="text-right font-mono">
          {getEfficiency(props.stats).toFixed(0)}
        </div>
        <div
          class={clsx(
            "text-right font-mono",
            kdr() > 1 ? "text-green-700" : "text-red-700",
          )}
        >
          {kdr().toFixed(2)}
        </div>
        <div class="text-right font-mono">{getKills(props.stats)}</div>
        <div class="text-right font-mono">{getDeaths(props.stats)}</div>
        <div
          class={clsx(
            "text-right font-mono",
            props.stats.playerStats.damageGiven >
              props.stats.playerStats.damageReceived
              ? "text-green-700"
              : "text-red-700",
          )}
        >
          {props.stats.playerStats.damageGiven}
        </div>
        <div class="text-right font-mono">
          {props.stats.playerStats.damageReceived}
        </div>
        <div class="text-right font-mono">{getHeadshots(props.stats)}</div>
        <div class="text-right font-mono">{props.stats.playerStats.gibs}</div>
        <div class="text-right font-mono">
          {props.stats.playerStats.selfKills}
        </div>
        <div class="text-right font-mono">{getRevives(props.stats)}</div>
        <div class="text-right font-mono">
          {props.stats.playerStats.playtime.toFixed(0)}
        </div>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <PlayerDetailedStats stats={props.stats} />
      </Collapsible.Content>
    </Collapsible>
  );
};
