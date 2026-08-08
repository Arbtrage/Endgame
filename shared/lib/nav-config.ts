export type NavLink = {
  href: string;
  label: string;
};

export type NavGroup = {
  label: string;
  items: NavLink[];
};

export const appNavGroups: NavGroup[] = [
  {
    label: "Home",
    items: [{ href: "/dashboard", label: "Dashboard" }],
  },
  {
    label: "Play",
    items: [
      { href: "/play/computer", label: "Vs villains" },
      { href: "/play/ai", label: "Vs heroes" },
      { href: "/play/coach", label: "Coach mode" },
      { href: "/play/pvp", label: "Vs friend" },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/analyze", label: "Analyze" },
      { href: "/train", label: "Train" },
      { href: "/progress", label: "Progress" },
      { href: "/coach", label: "Coach chat" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/settings", label: "Settings" },
      { href: "/gameplay", label: "Spectate" },
    ],
  },
];

export const marketingNavLinks: NavLink[] = [
  { href: "/demo", label: "Demo" },
  { href: "/auth/sign-in", label: "Sign in" },
];

export function flattenNavGroups(groups: NavGroup[]): NavLink[] {
  return groups.flatMap((group) => group.items);
}
