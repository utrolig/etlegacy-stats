import type { Component } from "solid-js";
import type { MatchStats } from "../util/stats";

export type MatchScoreProps = {
  match: MatchStats;
};

export const MatchScore: Component<MatchScoreProps> = (props) => {
  return (
    <div class="flex items-center z-10 text-6xl gap-2">
      <h1>{props.match.score.alpha}</h1>
      <p>:</p>
      <h1>{props.match.score.beta}</h1>
    </div>
  );
};
