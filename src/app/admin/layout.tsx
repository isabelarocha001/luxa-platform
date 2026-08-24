import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/creators", label: "Creators" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/subscriptions", label: "Subscriptions" },
];

/**
 * Admin shell — only role=admin or ADMIN_EMAILS.
 * Separate from public AppShell nav feel but still under site layout.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect("/auth/login?next=/admin");
    }
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 px-3 py-6 sm:px-4">
      <div className="mb-6 flex min-w-0 flex-col gap-3 border-b border-luxa-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-luxa-accent">
            Admin
          </p>
          <h1 className="truncate text-xl font-bold sm:text-2xl">Luxa control panel</h1>
          <p className="truncate text-xs text-luxa-muted">
            {auth.profile?.email || auth.user?.email}
          </p>
        </div>
        <Link
          href="/"
          className="shrink-0 text-sm text-luxa-muted hover:text-luxa-text"
        >
          ← Back to site
        </Link>
      </div>

      <nav className="mb-6 flex gap-1 overflow-x-auto pb-1">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="shrink-0 rounded-full border border-luxa-border bg-luxa-card px-3 py-1.5 text-xs font-medium text-luxa-muted hover:border-luxa-accent/40 hover:text-luxa-text sm:text-sm"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
