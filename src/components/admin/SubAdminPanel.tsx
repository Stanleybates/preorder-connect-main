import { SUB_ADMIN_REQUESTS, approveSubAdmin, rejectSubAdmin } from "@/lib/store-data";

type Props = {
  onChange: () => void;
  notify: (message: string, type: "success" | "error") => void;
};

export function SubAdminPanel({ onChange, notify }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Placeholder data — this will connect to real sub-admin sign-up requests once wired to the backend.
      </div>

      {SUB_ADMIN_REQUESTS.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No pending sub-admin requests.
        </div>
      ) : (
        <div className="grid gap-3">
          {SUB_ADMIN_REQUESTS.map(req => (
            <div key={req.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
              <div>
                <div className="font-semibold">
                  {req.username} <span className="text-xs text-muted-foreground">• {req.roleRequested}</span>
                </div>
                <div className="text-sm text-muted-foreground">{req.email} · {req.date}</div>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`rounded-full px-3 py-1 text-sm ${
                    req.status === "pending"
                      ? "bg-yellow-50 text-yellow-800"
                      : req.status === "approved"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {req.status}
                </div>
                {req.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        approveSubAdmin(req.id);
                        onChange();
                        notify(`Approved ${req.username}`, "success");
                      }}
                      className="rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        rejectSubAdmin(req.id);
                        onChange();
                        notify(`Rejected ${req.username}`, "error");
                      }}
                      className="rounded-2xl bg-red-500 px-3 py-2 text-sm font-semibold text-white"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
