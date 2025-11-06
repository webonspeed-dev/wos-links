"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Settings,
  Zap,
  Globe,
  Key,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Links", href: "/dashboard/links", icon: Link2 },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Domains", href: "/dashboard/domains", icon: Globe },
  { name: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-primary text-primary-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-primary-foreground/10">
        <div className="flex items-center gap-2">
          <Zap className="h-8 w-8" />
          <span className="text-xl font-bold">WOS Links</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-foreground/10 text-white"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-primary-foreground/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-sm font-medium">
            👤
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">User Name</p>
            <p className="text-xs text-primary-foreground/70">Pro Plan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
