import { adminDb } from "@/lib/admin";

export default async function AdminSubscriptionsPage() {
  const db = adminDb();
  const { data: rows, error } = await db
    .from("luxa_subscriptions")
    .select(
      "id, status, plan_months, stripe_subscription_id, current_period_end, created_at, fan_id, creator_id",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="min-w-0">
      <h2 className="mb-3 text-lg font-bold">Subscriptions</h2>
      <p className="mb-4 text-xs text-luxa-muted">
        Sincronizadas via Stripe webhook quando o creator existe no banco.
      </p>
      {error && <p className="text-sm text-red-400">{error.message}</p>}
      <div className="overflow-x-auto rounded-xl border border-luxa-border">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-luxa-surface text-xs uppercase text-luxa-muted">
            <tr>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Stripe sub</th>
              <th className="px-3 py-2">Period end</th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((r) => (
              <tr key={r.id} className="border-t border-luxa-border">
                <td className="px-3 py-2">{r.status}</td>
                <td className="px-3 py-2">{r.plan_months} mo</td>
                <td className="max-w-[140px] truncate px-3 py-2 text-xs text-luxa-muted">
                  {r.stripe_subscription_id || "—"}
                </td>
                <td className="px-3 py-2 text-xs text-luxa-muted">
                  {r.current_period_end
                    ? new Date(r.current_period_end).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
            {!rows?.length && !error && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-luxa-muted">
                  No subscriptions yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
