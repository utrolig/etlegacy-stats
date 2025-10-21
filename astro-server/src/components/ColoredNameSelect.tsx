import { Select } from "@kobalte/core/select";
import { For, type Component } from "solid-js";
import { getColoredParts } from "../util/colors";
import { BsCheck, BsChevronDown } from "solid-icons/bs";

export type ColoredNameSelectProps = {
  names: string[];
  selectedName: string;
  onChange: (playerName: string | null) => void;
};

export const ColoredNameSelect: Component<ColoredNameSelectProps> = (props) => {
  return (
    <Select
      onChange={props.onChange}
      options={props.names}
      value={props.selectedName}
      itemComponent={(props) => (
        <Select.Item
          class="p-2 flex items-center gap-2 hover:bg-mud-700 cursor-pointer"
          item={props.item}
        >
          <Select.ItemLabel>
            <For each={getColoredParts(props.item.rawValue)}>
              {(part) => <span style={{ color: part.color }}>{part.text}</span>}
            </For>
          </Select.ItemLabel>
          <Select.ItemIndicator>
            <BsCheck />
          </Select.ItemIndicator>
        </Select.Item>
      )}
    >
      <Select.Trigger>
        <Select.Value>
          {(state) => (
            <div class="flex items-center gap-1">
              <For each={getColoredParts(state.selectedOption() as string)}>
                {(part) => (
                  <span style={{ color: part.color }}>{part.text}</span>
                )}
              </For>
              <BsChevronDown size={12} />
            </div>
          )}
        </Select.Value>
      </Select.Trigger>
      <Select.Content class="bg-mud-800 z-60 rounded-md border border-mud-400">
        <Select.Listbox />
      </Select.Content>
    </Select>
  );
};
