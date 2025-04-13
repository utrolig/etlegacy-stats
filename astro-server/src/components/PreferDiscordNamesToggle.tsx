import type { Component } from "solid-js";
import clsx from "clsx";
import { DiscordIcon } from "./DiscordIcon";
import { EtlIcon } from "./EtlIcon";
import { Tooltip } from "./Tooltip";

export type PreferDiscordNamesToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export const PreferDiscordNamesToggle: Component<
  PreferDiscordNamesToggleProps
> = (props) => {
  return (
    <Tooltip content="Toggle Discord/ET names">
      <div
        class="flex items-center gap-4 cursor-pointer"
        onClick={() => props.onChange(!props.value)}
      >
        <div class="bg-white/5 rounded-md p-2 px-3 flex items-center gap-2 hover:bg-mud-700">
          <EtlIcon
            class={clsx("size-6 transition-all", {
              ["grayscale"]: props.value,
            })}
          />
          <DiscordIcon
            class={clsx("size-6 transition-all", {
              ["fill-mud-300"]: !props.value,
            })}
          />
        </div>
      </div>
    </Tooltip>
  );
};
