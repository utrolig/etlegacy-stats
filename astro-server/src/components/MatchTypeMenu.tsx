import clsx from "clsx";
import { createEffect, onCleanup, type Component } from "solid-js";

export type MatchTypeMenuProps = {
  type: string | null;
  onTypeChanged: (type: string | null) => void;
};

export const MatchTypeMenu: Component<MatchTypeMenuProps> = (props) => {
  createEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const typeParam = searchParams.get("type");
      props.onTypeChanged(typeParam);
    };

    window.addEventListener("popstate", handlePopState);

    onCleanup(() => {
      window.removeEventListener("popstate", handlePopState);
    });
  });

  const onLinkClick = (e: MouseEvent, type: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    props.onTypeChanged(type);

    if (!type) {
      history.pushState({}, "", location.pathname);
      return;
    }

    const qp = new URLSearchParams();

    qp.set("type", type);
    history.pushState({}, "", `${location.pathname}?${qp.toString()}`);
  };

  return (
    <div class="flex items-center">
      <a
        class={clsx(
          "py-4 px-8 border-b-2 border-orange-400",
          !props.type ? "border-orange-400" : "border-transparent",
        )}
        href="/"
        onClick={(e) => onLinkClick(e)}
      >
        All
      </a>
      <a
        class={clsx(
          "py-4 px-8 border-b-2 border-orange-400",
          props.type === "6v6" ? "border-orange-400" : "border-transparent",
        )}
        onClick={(e) => onLinkClick(e, "6v6")}
        href="?type=6v6"
      >
        6v6
      </a>
      <a
        class={clsx(
          "py-4 px-8 border-b-2 border-orange-400",
          props.type === "3v3" ? "border-orange-400" : "border-transparent",
        )}
        onClick={(e) => onLinkClick(e, "3v3")}
        href="?type=3v3"
      >
        3v3
      </a>
    </div>
  );
};
