import clsx from "clsx";
import type { Component } from "solid-js";

const links = [
  { href: "/", label: "All matches" },
  {
    href: "/6v6",
    label: "6v6",
  },
  {
    href: "/3v3",
    label: "3v3",
  },
];

export type MatchTypeMenuProps = {
  currentType: "/3v3" | "/6v6" | "/";
};

export const MatchTypeMenu: Component<MatchTypeMenuProps> = (props) => {
  return (
    <div class="flex items-center">
      {links.map(({ href, label }) => (
        <a
          class={clsx(
            "py-4 px-8 border-b-2 ",
            href !== props.currentType && "border-transparent",
            href === props.currentType && "border-orange-400",
          )}
          href={href}
        >
          {label}
        </a>
      ))}
    </div>
  );
};
