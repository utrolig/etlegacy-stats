import clsx from "clsx";
import { type Component } from "solid-js";

export type MatchTypeMenuProps = {
  currentUrl: string;
  size?: number;
  search?: boolean;
};

export const MatchTypeMenu: Component<MatchTypeMenuProps> = (props) => {
  const getSizeLink = (size?: number) => {
    const url = new URL(props.currentUrl);
    const sp = new URLSearchParams(url.search);

    if (!size) {
      sp.delete("size");
    } else {
      sp.set("size", size.toString());
    }

    sp.set("page", "1");

    return `/?${sp.toString()}`;
  };

  return (
    <div class="flex items-center sticky top-0 bg-mud-800">
      <a
        class={clsx(
          "py-4 px-8 border-b-2 border-orange-400",
          !props.size ? "border-orange-400" : "border-transparent",
        )}
        href={getSizeLink()}
      >
        All
      </a>
      <a
        class={clsx(
          "py-4 px-8 border-b-2 border-orange-400",
          props.size === 12 ? "border-orange-400" : "border-transparent",
        )}
        href={getSizeLink(12)}
      >
        6v6
      </a>
      <a
        class={clsx(
          "py-4 px-8 border-b-2 border-orange-400",
          props.size === 6 ? "border-orange-400" : "border-transparent",
        )}
        href={getSizeLink(6)}
      >
        3v3
      </a>
      <a
        class={clsx(
          "py-4 px-8 border-b-2 border-orange-400",
          props.size === 2 ? "border-orange-400" : "border-transparent",
        )}
        href={getSizeLink(2)}
      >
        1v1
      </a>

      <a
        class={clsx(
          "py-4 px-8 border-b-2 border-orange-400 ml-auto",
          props.search ? "border-orange-400" : "border-transparent",
        )}
        href="/search"
      >
        Search
      </a>
    </div>
  );
};
