import defaultTheme from "tailwindcss/defaultTheme";

const statsColumns = [
  {
    name: "Name",
    value: "minmax(14rem, 1fr)",
  },
  {
    name: "Efficiency",
    value: "3.5rem",
  },
  {
    name: "KDR",
    value: "3.5rem",
  },
  {
    name: "Kills",
    value: "4.5rem",
  },
  {
    name: "Deaths",
    value: "4.5rem",
  },
  {
    name: "Damage given",
    value: "5rem",
  },
  {
    name: "Damage received",
    value: "5rem",
  },
  {
    name: "HS",
    value: "3rem",
  },
  {
    name: "Gibs",
    value: "3.5rem",
  },
  {
    name: "Selfkills",
    value: "2.5rem",
  },
  {
    name: "Revives",
    value: "2.5rem",
  },
  {
    name: "Time Played",
    value: "3.5rem",
  },
];

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      gridTemplateColumns: {
        stats: statsColumns.map(({ value }) => value).join(" "),
      },
      fontFamily: {
        sans: ["Rubik Variable", ...defaultTheme.fontFamily.sans],
        mono: ["Mona Space", "Times New Roman"],
      },
      colors: {
        bush: {
          50: "#f9f5f3",
          100: "#ece1d7",
          200: "#e3d2c5",
          300: "#d1b4a0",
          400: "#bd927a",
          500: "#b0785f",
          600: "#a36753",
          700: "#875347",
          800: "#6e453e",
          900: "#5a3a34",
          950: "#301d1a",
        },
        mud: {
          50: "#C5BEB8",
          100: "#BBB3AD",
          200: "#A99F97",
          300: "#968A81",
          400: "#82766C",
          500: "#6C6159",
          600: "#564D47",
          700: "#3F3934",
          800: "#292522",
          900: "#0A0909",
          950: "#000000",
        },
      },
    },
  },
  plugins: [],
};
