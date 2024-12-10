import type { Component } from "solid-js";
import type { MatchStats } from "../util/stats";

export type WeaponAwardsProps = {
  match: MatchStats;
};

export const WeaponAwards: Component<WeaponAwardsProps> = (props) => {
  return (
    <div class="p-8">
      <h1 class="text-xl font-semibold text-orange-200">Weapon awards</h1>
    </div>
  );
};
