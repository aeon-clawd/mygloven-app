import { Sidebar, type NavItem } from "./sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
  items: NavItem[];
  role: string;
}

export function DashboardShell({ children, items, role }: DashboardShellProps) {
  return (
    <div className="min-h-screen">
      <Sidebar items={items} role={role} />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
