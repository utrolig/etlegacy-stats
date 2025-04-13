import { For, type Component } from "solid-js";
import { getColoredNameParts } from "../util/colors";

export type ColoredNameProps = {
  class?: string;
  name: string;
};

export const ColoredName: Component<ColoredNameProps> = (props) => {
  return (
    <span class={props.class}>
      <For each={getColoredNameParts(props.name)}>
        {(part) => <span style={{ color: part.color }}>{part.text}</span>}
      </For>
    </span>
  );
};
