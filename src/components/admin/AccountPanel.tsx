import { FormEvent, useEffect, useState } from "react";
import { Camera, KeyRound } from "lucide-react";
import { changePassword, getCurrentUser, getProfilePhoto, setProfilePhoto } from "@/lib/auth-store";

type Props = {
  notify: (message: string, type: "success" | "error") => void;
  onChange?: () => void;
};

export function AccountPanel({ notify, onChange }: Props) {
  const currentUser = getCurrentUser();
  const [photoPreview, setPhotoPreviewState] = useState<string | null>(getProfilePhoto());
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPhotoPreviewState(getProfilePhoto());
  }, []);

  const onPhotoChange = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfilePhoto(reader.result);
        setPhotoPreviewState(reader.result);
        notify("Profile photo updated", "success");
        onChange?.();
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmitPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      notify("New passwords do not match", "error");
      return;
    }

    setLoading(true);
    const result = await changePassword(oldPassword, newPassword);
    setLoading(false);

    if (result.success) {
      notify(result.message, "success");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      notify(result.message, "error");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border px-3 py-2 bg-background focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-3d">
        <h2 className="mb-4 text-xl font-semibold">Profile Photo</h2>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-muted text-2xl font-bold">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              currentUser?.username?.slice(0, 1).toUpperCase() ?? "A"
            )}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-medium transition-colors hover:border-primary hover:bg-primary/10">
            <Camera className="h-4 w-4 text-primary" />
            Upload photo
            <input
              type="file"
              accept="image/*"
              onChange={e => onPhotoChange(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-6 shadow-3d">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
          <KeyRound className="h-5 w-5" /> Change Password
        </h2>
        <form className="grid gap-4" onSubmit={onSubmitPassword}>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Current password</span>
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={inputClass}
              autoComplete="new-password"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
