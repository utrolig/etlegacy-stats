import type { Component } from "solid-js";
import { DiscordIcon } from "./DiscordIcon";
import { EtlIcon } from "./EtlIcon";
import { Switch } from "@kobalte/core/switch";

export type PreferDiscordNamesToggleProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export const PreferDiscordNamesToggle: Component<
  PreferDiscordNamesToggleProps
> = (props) => {
  return (
    <Switch
      class="flex items-center gap-2"
      onChange={props.onChange}
      checked={props.value}
    >
      <Switch.Label class="text-sm text-mud-300">Discord names</Switch.Label>
      <Switch.Input />
      <Switch.Control class="flex relative items-center h-8 w-16 border border-mud-400 rounded-3xl py-2 px-1 bg-mud-700">
        <EtlIcon class="absolute right-2 size-4" />
        <DiscordIcon class="absolute left-2 size-4" />
        <Switch.Thumb class="size-6 rounded-full data-[checked]:translate-x-[31px] bg-[#ff1e00] data-[checked]:bg-[#4e5df1] z-10 transition-transform" />
      </Switch.Control>
    </Switch>
  );
};
