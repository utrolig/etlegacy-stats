import { createMemo, For, type Component } from "solid-js";
import type { TeamList as TeamListType, Team } from "../util/stats";
import { getColoredParts } from "../util/colors";

export type TeamListProps = {
  team: Team;
  teamList: TeamListType;
};

export const TeamList: Component<TeamListProps> = (props) => {
  const players = createMemo(() => {
    return props.teamList[props.team];
  });

  return (
    <div class="z-10 flex flex-col items-center justify-center gap-6 text-xl font-semibold">
      <p class="text-sm text-white lg:text-xl capitalize">{props.team}</p>
      <div class="flex flex-col items-center">
        <For each={players()}>
          {(player) => (
            <div class="text-xs lg:text-xl">
              {getColoredParts(player.name).map((part) => (
                <span
                  style={{
                    color: part.color,
                    "text-shadow": "1px 1px 0px #000",
                  }}
                >
                  {part.text}
                </span>
              ))}
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
