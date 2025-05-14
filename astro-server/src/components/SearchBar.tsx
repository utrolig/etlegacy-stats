import { FiSearch } from "solid-icons/fi";
import type { Component } from "solid-js";

export type SearchBarProps = {
  value?: string;
};

export const SearchBar: Component<SearchBarProps> = (props) => {
  return (
    <form
      class="flex items-center bg-mud-800 py-2 gap-4 sticky top-0"
      method="get"
    >
      <div class="flex items-center gap-2 w-full">
        <input
          class="bg-mud-900/40 text-mud-200 p-2 pr-12 rounded-md w-full outline-none focus:ring-2 focus:ring-mud-500"
          autocomplete="off"
          value={props.value}
          type="text"
          name="q"
          placeholder="Search..."
        />
        <button class="absolute right-4" type="submit">
          <FiSearch />
        </button>
      </div>
    </form>
  );
};
