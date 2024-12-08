import { Show, type Component } from "solid-js";
import { SortDirection, type SortKey } from "../util/sorting";
import {
  TiArrowSortedUp,
  TiArrowSortedDown,
  TiArrowUnsorted,
} from "solid-icons/ti";
import clsx from "clsx";

export type TableHeaderColumnProps = {
  alignStart?: boolean;
  sortKey: SortKey;
  sortDirection: SortDirection;
  columnKey: SortKey;
  onClick: (key: SortKey) => void;
};

export const TableHeaderColumn: Component<TableHeaderColumnProps> = (props) => {
  return (
    <div
      class={clsx(
        "uppercase flex items-center gap-1 select-none cursor-pointer",
        !props.alignStart && "justify-end",
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
      <span>{props.columnKey}</span>
    </div>
  );
};
