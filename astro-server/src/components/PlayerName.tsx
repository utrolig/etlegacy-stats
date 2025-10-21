import { For, Show, type Component } from "solid-js";
import { getColoredParts } from "../util/colors";
import { Tooltip } from "./Tooltip";
import { DiscordIcon } from "./DiscordIcon";
import type { PlayerInfo } from "../util/stats-api";
import type { MatchPlayer } from "../util/stats";

export type PlayerNameProps = {
  preferDiscordNames: boolean;
  playerInfo: PlayerInfo;
  player: MatchPlayer;
};

export const PlayerName: Component<PlayerNameProps> = (props) => {
  return (
    <div class="flex items-center overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
      <Show
        when={props.preferDiscordNames && props.playerInfo}
        fallback={
          <For each={getColoredParts(props.player?.name ?? "Unknown")}>
            {({ color, text }) => (
              <span
                class="overflow-hidden whitespace-pre text-ellipsis"
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
        <Tooltip placement="right" content={props.playerInfo.discord_nick}>
          <DiscordIcon class="size-4 fill-mud-500 ml-2" />
        </Tooltip>
      </Show>
    </div>
  );
};
