import { For, type Component } from "solid-js";
import type { Message, PlayerInfoDict } from "../util/stats-api";
import type { MatchPlayer } from "../util/stats";
import { MessageLine } from "./MessageLine";
import { Tooltip } from "./Tooltip";
import { AiFillQuestionCircle } from "solid-icons/ai";

export type MessagesProps = {
  messages: Message[];
  players: Record<string, MatchPlayer>;
  playerInfoDict: PlayerInfoDict;
  preferDiscordNames: boolean;
};

export const Messages: Component<MessagesProps> = (props) => {
  return (
    <div class="big:p-8 p-4 flex flex-col gap-4 bg-black/10">
      <div class="flex gap-2">
        <h1 class="big:text-xl font-semibold text-orange-50">Chat</h1>
        <Tooltip content="10M paid in full by anonymous donator. Timestamps are not available because #FUCKOKSI. Parenthesized names are say_team messages.">
          <AiFillQuestionCircle class="text-mud-300" />
        </Tooltip>
      </div>
      <div class="flex flex-col gap-1">
        <For each={props.messages}>
          {(msg) => (
            <MessageLine
              preferDiscordNames={props.preferDiscordNames}
              players={props.players}
              playerInfoDict={props.playerInfoDict}
              message={msg}
            />
          )}
        </For>
      </div>
    </div>
  );
};
