import { adminDb } from "@/lib/admin";

export default async function AdminUsersPage() {
  const db = adminDb();
  const { data: users, error } = await db
    .from("luxa_profiles")
    .select("id, email, display_name, role, created_at, is_verified_age")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="min-w-0">
      <h2 className="mb-3 text-lg font-bold">Users (luxa_profiles)</h2>
      <p className="mb-4 text-xs text-luxa-muted">
        Contas criadas via signup. Role: fan | creator | admin.
      </p>
      {error && <p className="text-sm text-red-400">{error.message}</p>}
      <div className="overflow-x-auto rounded-xl border border-luxa-border">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="bg-luxa-surface text-xs uppercase text-luxa-muted">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id} className="border-t border-luxa-border">
                <td className="max-w-[160px] truncate px-3 py-2">{u.email}</td>
                <td className="max-w-[120px] truncate px-3 py-2">
                  {u.display_name || "—"}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={
                      u.role === "admin"
                        ? "text-luxa-accent"
                        : "text-luxa-muted"
                    }
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-luxa-muted">
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
            {!users?.length && !error && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-luxa-muted">
                  No users yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
