import { Cloud, LogOut, User, X } from "lucide-react";
import { formatLastSyncedAt, getDisplayName } from "../../studySync";

export default function AccountPanel({
  authUser,
  lastSyncedAt,
  onClose,
  onSignOut,
  syncNotice,
}) {
  return (
    <div
      className="modal-enter-backdrop fixed inset-0 z-[75] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="modal-enter-panel soft-panel w-full max-w-lg p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300/70">
              Sua conta
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Google conectado</h3>
            <p className="mt-2 text-sm text-slate-300">
              Seus blocos de estudo ficam vinculados a esta conta e podem ser acessados em qualquer dispositivo.
            </p>
          </div>
          <button type="button" className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="soft-panel p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Nome</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <User className="h-5 w-5 text-sky-300" />
              </div>
              <p className="text-sm font-semibold text-white">{getDisplayName(authUser)}</p>
            </div>
          </article>

          <article className="soft-panel p-4">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Email</p>
            <p className="mt-3 break-all text-sm font-semibold text-white">{authUser?.email || "Sem email"}</p>
          </article>
        </div>

        <div className="mt-5 rounded-3xl border border-sky-500/15 bg-sky-500/10 p-4">
          <div className="flex items-center gap-2 text-sky-200">
            <Cloud className="h-4 w-4" />
            <p className="text-sm font-semibold">Sincronizacao do estudo</p>
          </div>
          <p className="mt-2 text-sm text-sky-100/80">{syncNotice || "Sua conta esta pronta para salvar na nuvem."}</p>
          <p className="mt-2 text-xs text-sky-100/60">Ultima sincronizacao: {formatLastSyncedAt(lastSyncedAt)}</p>
        </div>

        <button
          type="button"
          className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
}
