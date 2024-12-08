import type { Component } from "solid-js";
import type { MatchStats } from "../util/stats";

export type MatchScoreProps = {
  match: MatchStats;
};

export const MatchScore: Component<MatchScoreProps> = (props) => {
  return <div class="flex flex-1">Hello</div>;
};
