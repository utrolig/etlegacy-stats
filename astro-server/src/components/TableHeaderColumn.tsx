import { createSignal, Show, type Component } from "solid-js";
import { getColumnDescription, SortDirection, SortKey } from "../util/sorting";
import {
  TiArrowSortedUp,
  TiArrowSortedDown,
  TiArrowUnsorted,
} from "solid-icons/ti";
import clsx from "clsx";
import { Tooltip } from "./Tooltip";
import type { AnchorRect } from "@kobalte/core/src/popper/utils.js";

export type TableHeaderColumnProps = {
  alignStart?: boolean;
  sortKey: SortKey;
  sortDirection: SortDirection;
  columnKey: SortKey;
  onClick: (key: SortKey) => void;
  sticky?: boolean;
  last?: boolean;
};

export const TableHeaderColumn: Component<TableHeaderColumnProps> = (props) => {
  const [anchorRef, setAnchorRef] = createSignal<HTMLElement>();

  const getAnchorRect = (): AnchorRect => {
    const ref = anchorRef();
    if (!ref) {
      return {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
    }

    return ref.getBoundingClientRect();
  };

  return (
    <Tooltip
      triggerClass={clsx("justify-end")}
      content={getColumnDescription(props.columnKey)}
      getAnchorRect={getAnchorRect}
    >
      <div
        class={clsx(
          "flex items-center gap-1 select-none cursor-pointer",
          !props.alignStart && "justify-end",
          props.sticky && "sticky left-0 bg-stats-bg pl-4",
          props.last && "pr-4",
        )}
        onClick={() => props.onClick(props.columnKey)}
      >
        <Show
          when={props.sortKey === props.columnKey}
          fallback={<TiArrowUnsorted class="size-4 text-mud-700" />}
        >
          <Show when={props.sortDirection === SortDirection.Asc}>
            <TiArrowSortedUp class="size-4 text-white" />
          </Show>
          <Show when={props.sortDirection === SortDirection.Desc}>
            <TiArrowSortedDown class="size-4 text-white" />
          </Show>
        </Show>
        <span
          ref={setAnchorRef}
          class={clsx("uppercase text-xs font-semibold text-mud-300", {
            "ml-[6px]": props.columnKey === SortKey.Name,
          })}
        >
          {props.columnKey}
        </span>
      </div>
    </Tooltip>
  );
};
