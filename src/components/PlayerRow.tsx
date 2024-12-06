import { type Component } from "solid-js";
import type { Player } from "../util/match";
import { getKdr } from "../util/weaponStats";

export type PlayerRowProps = {
  player: Player;
};

export const PlayerRow: Component<PlayerRowProps> = (props) => {
  return (
    <div class="flex items-center gap-4">
      <div class="w-64">{props.player.name}</div>
      <div>{getKdr(props.player.weaponStatsAggregate).toFixed(2)}</div>
      <div>{props.player.weaponStatsAggregate.kills}</div>
    </div>
  );
};
