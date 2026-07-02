import {
  Home,
  PersonStanding,
  GraduationCap,
  Wallet,
  Sun,
  Moon,
  MonitorCog,
  type LucideIcon,
} from "lucide-react";

// Central place to map a module's `icon` string to an actual icon component.
// Using lucide-react since it's already available in this environment;
// names are loosely modeled on Tabler's naming so they read the same way.
const ICONS: Record<string, LucideIcon> = {
  home: Home,
  run: PersonStanding,
  school: GraduationCap,
  wallet: Wallet,
  sun: Sun,
  moon: Moon,
  auto: MonitorCog,
};

export function getIcon(name: string): LucideIcon {
  return ICONS[name] ?? Home;
}
