import { createMemo, createSignal, For, Show, type Component } from "solid-js";
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
import type { PlayerInfo } from "../util/stats-api";
import { DiscordIcon } from "./DiscordIcon";
import { Tooltip } from "./Tooltip";

export type PlayerRowProps = {
  stats: Stats;
  playerInfo: PlayerInfo;
  preferDiscordNames: boolean;
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
      class="flex flex-col bg-mud-800 odd:bg-white/5 hover:bg-white/10"
    >
      <Collapsible.Trigger class="grid grid-cols-stats items-center gap-4 py-1 px-4">
        <div class="flex items-center gap-1 justify-start pl-[2px] h-7">
          <BsCaretRightFill
            class={clsx(
              "text-mud-400 transition-transform mr-2",
              open() && "rotate-90",
            )}
            size={12}
          />
          <div class="flex items-center overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
            <Show
              when={props.preferDiscordNames && props.playerInfo}
              fallback={
                <For each={getColoredNameParts(props.stats.name)}>
                  {({ color, text }) => (
                    <span
                      class="overflow-hidden whitespace-nowrap text-ellipsis"
                      style={{ color }}
                    >
                      {text}
                    </span>
                  )}
                </For>
              }
            >
              {props.playerInfo.discord_nick}
            </Show>
            <Show when={props.playerInfo && !props.preferDiscordNames}>
              <Tooltip
                placement="right"
                content={props.playerInfo.discord_nick}
              >
                <DiscordIcon class="size-4 fill-mud-500 ml-2" />
              </Tooltip>
            </Show>
          </div>
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
