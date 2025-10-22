import { For, Show, type Component } from "solid-js";
import { getColoredParts } from "../util/colors";
import { Tooltip } from "./Tooltip";
import { DiscordIcon } from "./DiscordIcon";
import type { PlayerInfo } from "../util/stats-api";
import type { MatchPlayer } from "../util/stats";
import { getAnonName } from "../util/getAnonName";

export type PlayerNameProps = {
  preferDiscordNames: boolean;
  playerInfo: PlayerInfo;
  player: MatchPlayer;
  guid: string;
};

export const PlayerName: Component<PlayerNameProps> = (props) => {
  return (
    <div class="flex items-center overflow-hidden text-ellipsis whitespace-nowrap font-semibold">
      <Show
        when={props.preferDiscordNames && props.playerInfo}
        fallback={
          <Show when={props.player?.name} fallback={getAnonName(props.guid)}>
            <For each={getColoredParts(props.player.name)}>
              {({ color, text }) => (
                <span
                  class="overflow-hidden whitespace-pre text-ellipsis"
                  style={{ color }}
                >
                  {text}
                </span>
              )}
            </For>
          </Show>
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
