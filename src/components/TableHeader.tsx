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
    <div class="grid grid-cols-statsSmall big:grid-cols-stats items-center gap-4 py-2 px-4">
      <TableHeaderColumn
        alignStart
        columnKey={SortKey.Name}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        hiddenOnMobile
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
        hiddenOnMobile
      />

      <TableHeaderColumn
        hiddenOnMobile
        columnKey={SortKey.DamageReceived}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        hiddenOnMobile
        columnKey={SortKey.Headshots}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        hiddenOnMobile
        columnKey={SortKey.Gibs}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        hiddenOnMobile
        columnKey={SortKey.Selfkills}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        hiddenOnMobile
        columnKey={SortKey.Revives}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />

      <TableHeaderColumn
        hiddenOnMobile
        columnKey={SortKey.TimePlayed}
        onClick={props.onSortClicked}
        sortDirection={props.sortDirection}
        sortKey={props.sortKey}
      />
    </div>
  );
};
