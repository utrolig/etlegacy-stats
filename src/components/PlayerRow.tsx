import { createMemo, createSignal, For, type Component } from "solid-js";
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
import { BsCaretRightFill } from "solid-icons/bs";

export type PlayerRowProps = {
  stats: Stats;
};

export const PlayerRow: Component<PlayerRowProps> = (props) => {
  const [open, setOpen] = createSignal(false);

  const kdr = createMemo(() => {
    return getKdr(props.stats);
  });

  return (
    <Collapsible
      onOpenChange={setOpen}
      open={open()}
      class="flex flex-col odd:bg-white/5 hover:bg-white/10"
    >
      <Collapsible.Trigger class="grid grid-cols-stats items-center gap-4 py-1 px-4">
        <div class="flex items-center gap-1 justify-start pl-[2px]">
          <BsCaretRightFill
            class={clsx(
              "text-mud-400 transition-transform",
              open() && "rotate-90",
            )}
            size={12}
          />
          <For each={getColoredNameParts(props.stats.name)}>
            {({ color, text }) => <span style={{ color }}>{text}</span>}
          </For>
        </div>
        <div class="text-right">{getEfficiency(props.stats).toFixed(0)}</div>
        <div
          class={clsx(
            "text-right",
            kdr() > 1 ? "text-green-700" : "text-red-700",
          )}
        >
          {kdr().toFixed(2)}
        </div>
        <div class="text-right">{getKills(props.stats)}</div>
        <div class="text-right">{getDeaths(props.stats)}</div>
        <div
          class={clsx(
            "text-right",
            props.stats.playerStats.damageGiven >
              props.stats.playerStats.damageReceived
              ? "text-green-700"
              : "text-red-700",
          )}
        >
          {props.stats.playerStats.damageGiven}
        </div>
        <div class="text-right">{props.stats.playerStats.damageReceived}</div>
        <div class="text-right">{getHeadshots(props.stats)}</div>
        <div class="text-right">{props.stats.playerStats.gibs}</div>
        <div class="text-right">{props.stats.playerStats.selfKills}</div>
        <div class="text-right">{getRevives(props.stats)}</div>
        <div class="text-right">
          {props.stats.playerStats.playtime.toFixed(0)}
        </div>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <PlayerDetailedStats stats={props.stats} />
      </Collapsible.Content>
    </Collapsible>
  );
};
