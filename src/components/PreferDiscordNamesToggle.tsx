import type { Component } from "solid-js";
import clsx from "clsx";
import { DiscordIcon } from "./DiscordIcon";
import { EtlIcon } from "./EtlIcon";

export type PreferDiscordNamesToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export const PreferDiscordNamesToggle: Component<
  PreferDiscordNamesToggleProps
> = (props) => {
  return (
    <div
      class="flex items-center gap-4 cursor-pointer"
      onClick={() => props.onChange(!props.value)}
    >
      <p class="text-sm">Player names</p>
      <div class="bg-mud-600 rounded-2xl p-2 px-3 flex items-center gap-2">
        <EtlIcon
          class={clsx("size-6 transition-all", { ["grayscale"]: props.value })}
        />
        <DiscordIcon
          class={clsx("size-6 transition-all", {
            ["fill-mud-300"]: !props.value,
          })}
        />
      </div>
    </div>
  );
};
