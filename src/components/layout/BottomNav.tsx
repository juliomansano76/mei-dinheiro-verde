import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Receipt, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Início", icon: Home },
  { to: "/lancamentos", label: "Lançamentos", icon: Receipt },
  { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { to: "/ajustes", label: "Ajustes", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-md items-end justify-around pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-3">
        {navItems.map((item) => {
          const isActive =
            item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group flex min-w-0 flex-1 flex-col items-center justify-center gap-2 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-transform duration-200",
                  isActive && "scale-105",
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="leading-none">{item.label}</span>
              <span
                className={cn(
                  "mt-0.5 h-1 w-1 rounded-full transition-all duration-200",
                  isActive ? "bg-primary" : "bg-transparent",
                )}
                aria-hidden="true"
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
