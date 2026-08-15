import { useEffect, useState } from "react";
import { getPendingAdmins, approveAdmin, rejectAdmin, type PendingAdmin } from "@/lib/auth-store";

type Props = {
  onChange: () => void;
  notify: (message: string, type: "success" | "error") => void;
};

export function SubAdminPanel({ onChange, notify }: Props) {
  const [admins, setAdmins] = useState<PendingAdmin[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actingOnId, setActingOnId] = useState<number | null>(null);

  const load = async (silent = false) => {
    if (!silent) setInitialLoading(true);
    const data = await getPendingAdmins();
    setAdmins(data);
    if (!silent) setInitialLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const onApprove = async (id: number, username: string) => {
    setActingOnId(id);
    const result = await approveAdmin(id);
    if (result.success) {
      setAdmins(prev => prev.map(a => (a.id === id ? { ...a, status: "approved" } : a)));
      notify(`Approved ${username}`, "success");
      onChange();
    } else {
      notify(result.message, "error");
    }
    setActingOnId(null);
  };

  const onReject = async (id: number, username: string) => {
    setActingOnId(id);
    const result = await rejectAdmin(id);
    if (result.success) {
      setAdmins(prev => prev.map(a => (a.id === id ? { ...a, status: "rejected" } : a)));
      notify(`Rejected ${username}`, "error");
      onChange();
    } else {
      notify(result.message, "error");
    }
    setActingOnId(null);
  };

  if (initialLoading) {
    return <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="space-y-4">
      {admins.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No sub-admin requests yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {admins.map(admin => (
            <div key={admin.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold">{admin.username}</div>
                  <div className="text-sm text-muted-foreground">
                    {admin.email || "—"} · {new Date(admin.date_joined).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className={`rounded-full px-3 py-1 text-sm ${
                      admin.status === "pending"
                        ? "bg-yellow-50 text-yellow-800"
                        : admin.status === "approved"
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-red-50 text-red-800"
                    }`}
                  >
                    {admin.status}
                  </div>
                  {admin.status === "pending" && (
                    <>
                      <button
                        onClick={() => onApprove(admin.id, admin.username)}
                        disabled={actingOnId === admin.id}
                        className="rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {actingOnId === admin.id ? "..." : "Approve"}
                      </button>
                      <button
                        onClick={() => onReject(admin.id, admin.username)}
                        disabled={actingOnId === admin.id}
                        className="rounded-2xl bg-red-500 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {actingOnId === admin.id ? "..." : "Reject"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
