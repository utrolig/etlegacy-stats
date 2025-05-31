import type { Component } from "solid-js";
import { SortDirection, SortKey } from "../util/sorting";
import { TableHeaderColumn } from "./TableHeaderColumn";

export type TableHeaderProps = {
  onSortClicked: (key: SortKey) => void;
  sortDirection: SortDirection;
  sortKey: SortKey;
};

export const TableHeader: Component<TableHeaderProps> = (props) => {
  return (
    <div class="grid grid-cols-stats items-center h-8 gap-4 border-b border-b-mud-300 w-full min-w-max">
      <TableHeaderColumn
        alignStart
        columnKey={SortKey.Name}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
        sticky
      />

      <TableHeaderColumn
        columnKey={SortKey.Effiency}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        columnKey={SortKey.Kdr}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        columnKey={SortKey.Kills}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        columnKey={SortKey.Deaths}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        columnKey={SortKey.DamageGiven}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        columnKey={SortKey.DamageReceived}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        columnKey={SortKey.Headshots}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        columnKey={SortKey.Gibs}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        columnKey={SortKey.Selfkills}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        columnKey={SortKey.Revives}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        columnKey={SortKey.TimePlayed}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        columnKey={SortKey.CustomRating}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
        last
      />
    </div>
  );
};
