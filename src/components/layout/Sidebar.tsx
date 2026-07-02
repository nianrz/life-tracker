"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PersonStanding, GraduationCap, Wallet, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { createClient } from "@/lib/db/supabase";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", Icon: Home,           route: "/"        },
  { id: "fitness",   label: "Fitness",   Icon: PersonStanding, route: "/fitness"  },
  { id: "student",   label: "Student",   Icon: GraduationCap,  route: "/student"  },
  { id: "finance",   label: "Finance",   Icon: Wallet,          route: "/finance"  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:shrink-0 border-r border-[var(--border)] h-screen sticky top-0 px-3 py-4">
      <div className="px-2 mb-6">
        <p className="text-[15px] font-medium">Life tracker</p>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ id, label, Icon, route }) => {
          const active = pathname === route;
          return (
            <Link
              key={id}
              href={route}
              className={`flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-[var(--bg-accent)] text-[var(--text-accent)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-1)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-2 px-1">
        <ThemeToggle />
        <button
          onClick={signOut}
          className="flex items-center gap-2 rounded-[var(--radius)] px-3 py-1.5 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-1)] transition-colors"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
