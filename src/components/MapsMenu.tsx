import { For, type Component } from "solid-js";
import type { MatchStats } from "../util/stats";
import clsx from "clsx";

export type MapsMenuProps = {
  activeMap?: string;
  match: MatchStats;
  matchId: string;
};

export const MapsMenu: Component<MapsMenuProps> = (props) => {
  return (
    <div class="flex p-8 gap-8">
      <a
        class={clsx(
          "text-2xl",
          !props.activeMap && "border-b-2 border-orange-400",
        )}
        href={`/matches/${props.matchId}`}
      >
        Total
      </a>
      <For each={props.match.maps}>
        {(map) => (
          <a
            class={clsx(
              "text-2xl",
              props.activeMap === map && "border-b-2 border-orange-400",
            )}
            href={`/matches/${props.matchId}/${map}`}
          >
            {map}
          </a>
        )}
      </For>
    </div>
  );
};
