import { createMemo, For, Match, Switch, type Component } from "solid-js";
import type { Message, PlayerInfoDict } from "../util/stats-api";
import type { MatchPlayer } from "../util/stats";
import { PlayerName } from "./PlayerName";
import { getColoredParts } from "../util/colors";
import { voicelines } from "../util/voicelines";
import { BsMegaphone } from "solid-icons/bs";

export type MessageLineProps = {
  message: Message;
  players: Record<string, MatchPlayer>;
  playerInfoDict: PlayerInfoDict;
  preferDiscordNames: boolean;
};

export const MessageLine: Component<MessageLineProps> = (props) => {
  return (
    <div class="flex gap-2 text-xs big:text-base hover:bg-black/10">
      <Switch>
        <Match when={props.message.command === "say"}>
          <PlayerName
            player={props.players[props.message.guid]}
            playerInfo={props.playerInfoDict[props.message.guid]}
            preferDiscordNames={props.preferDiscordNames}
            guid={props.message.guid}
          />
          <Msg color="#00FF00" msg={props.message.message} />
        </Match>

        <Match when={props.message.command === "say_team"}>
          <div class="flex items-start">
            <span>(</span>
            <PlayerName
              player={props.players[props.message.guid]}
              playerInfo={props.playerInfoDict[props.message.guid]}
              preferDiscordNames={props.preferDiscordNames}
              guid={props.message.guid}
            />
            <span>):</span>
          </div>
          <Msg color="#00FFFF" msg={props.message.message} />
        </Match>

        <Match when={props.message.command === "vsay_team"}>
          <div class="flex items-start">
            <span>(</span>
            <PlayerName
              player={props.players[props.message.guid]}
              playerInfo={props.playerInfoDict[props.message.guid]}
              preferDiscordNames={props.preferDiscordNames}
              guid={props.message.guid}
            />
            <span>):</span>
          </div>
          <div class="flex items-center gap-2">
            <BsMegaphone />
            <Msg
              color="#00FFFF"
              msg={
                voicelines[props.message.message] ??
                `UNKNOWN VSAY: ${props.message.message}`
              }
            />
          </div>
        </Match>

        <Match when={props.message.command === "vsay"}>
          <PlayerName
            player={props.players[props.message.guid]}
            playerInfo={props.playerInfoDict[props.message.guid]}
            preferDiscordNames={props.preferDiscordNames}
            guid={props.message.guid}
          />
          <div class="flex items-center gap-2">
            <BsMegaphone />
            <Msg
              color="#00FF00"
              msg={
                voicelines[props.message.message] ??
                `UNKNOWN VSAY: ${props.message.message}`
              }
            />
          </div>
        </Match>
      </Switch>
    </div>
  );
};

const Msg: Component<{ msg: string; color: string }> = (props) => {
  const parts = createMemo(() => {
    return getColoredParts(props.msg, props.color);
  });

  return (
    <For each={parts()}>
      {(part) => <span style={{ color: part.color }}>{part.text}</span>}
    </For>
  );
};
