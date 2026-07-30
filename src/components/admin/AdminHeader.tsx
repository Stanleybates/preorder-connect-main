import { ExternalLink, LogOut } from "lucide-react";
import { STORE } from "@/lib/store-data";

type Props = {
  username: string;
  profilePhoto: string | null;
  onLogout: () => void;
  onProfileClick?: () => void;
};

export function AdminHeader({ username, profilePhoto, onLogout, onProfileClick }: Props) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href="/admin" className="flex items-center gap-2">
          <img src="/sg-logo.svg" alt={STORE.name} className="h-8 w-8 rounded-lg object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <span className="font-display font-bold text-base sm:text-lg">{STORE.name}</span>
          <span className="hidden text-xs font-medium text-muted-foreground sm:inline">Admin</span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border px-2.5 py-2 text-xs font-semibold hover:bg-muted transition-colors sm:px-3 sm:text-sm"
          >
            <ExternalLink className="h-4 w-4" /> <span className="hidden sm:inline">View Store</span>
          </a>

          <button
            type="button"
            onClick={onProfileClick}
            className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-sm font-bold shrink-0">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                username.slice(0, 1).toUpperCase()
              )}
            </div>
            <span className="hidden max-w-[6rem] truncate text-sm font-medium sm:inline">{username}</span>
          </button>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-2.5 py-2 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-colors sm:px-3 sm:text-sm"
          >
            <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
