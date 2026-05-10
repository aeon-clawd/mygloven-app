import { Sidebar, type NavItem } from "./sidebar";
import { Marquee } from "./marquee";
import { Topbar } from "./topbar";

interface DashboardShellProps {
  children: React.ReactNode;
  items: NavItem[];
  role: string;
  marqueeItems?: string[];
}

export function DashboardShell({ children, items, role, marqueeItems }: DashboardShellProps) {
  return (
    <div className="app-root">
      <Marquee items={marqueeItems} />
      <div className="shell">
        <Sidebar items={items} role={role} />
        <main className="main">
          <Topbar />
          <div className="scroll-area">{children}</div>
        </main>
      </div>
    </div>
  );
}
