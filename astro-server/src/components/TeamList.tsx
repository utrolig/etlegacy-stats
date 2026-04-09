import { createMemo, For, type Component } from "solid-js";
import type { TeamList as TeamListType, Team } from "../util/stats";
import { getColoredParts } from "../util/colors";
import clsx from "clsx";

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
      <div class="flex items-center gap-1.5">
        <div
          class={clsx(
            "w-2 h-2 rounded-full shrink-0",
            props.team === "alpha" ? "bg-blue-300" : "bg-red-300",
          )}
        />
        <p class="text-sm text-white lg:text-xl capitalize">{props.team}</p>
      </div>
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
