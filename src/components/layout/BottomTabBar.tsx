"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PersonStanding, GraduationCap, Wallet } from "lucide-react";

// Must stay in sync with Sidebar.tsx when adding new modules.
const NAV_ITEMS = [
  { id: "dashboard", label: "Home",    Icon: Home,           route: "/"        },
  { id: "fitness",   label: "Fitness", Icon: PersonStanding, route: "/fitness"  },
  { id: "student",   label: "Student", Icon: GraduationCap,  route: "/student"  },
  { id: "finance",   label: "Finance", Icon: Wallet,          route: "/finance"  },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--surface-2)] flex justify-around py-2 z-50">
      {NAV_ITEMS.map(({ id, label, Icon, route }) => {
        const active = pathname === route;
        return (
          <Link
            key={id}
            href={route}
            className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[60px]"
          >
            <Icon
              size={22}
              className={active ? "text-[var(--text-accent)]" : "text-[var(--text-muted)]"}
            />
            <span className={`text-[11px] ${active ? "text-[var(--text-accent)]" : "text-[var(--text-muted)]"}`}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
