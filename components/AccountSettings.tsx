"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError } from "@/lib/api";

export default function AccountSettings() {
  const { user, token, logout, refresh } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name ?? "");
  const [nameStatus, setNameStatus] = useState<"idle" | "saving" | "done">("idle");
  const [nameFeedback, setNameFeedback] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "saving" | "done">("idle");
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<"idle" | "deleting">("idle");
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

  if (!user || !token) return null;

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !name.trim() || nameStatus === "saving") return;
    setNameStatus("saving");
    setNameFeedback(null);
    try {
      await api.updateName(token, name.trim());
      await refresh();
      setNameFeedback("Nombre actualizado.");
    } catch (err) {
      setNameFeedback(err instanceof ApiError ? err.message : "No se pudo actualizar el nombre.");
    } finally {
      setNameStatus("done");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !currentPassword || !newPassword || passwordStatus === "saving") return;
    setPasswordStatus("saving");
    setPasswordFeedback(null);
    try {
      await api.changePassword(token, currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setPasswordFeedback("Contraseña actualizada.");
    } catch (err) {
      setPasswordFeedback(err instanceof ApiError ? err.message : "No se pudo cambiar la contraseña.");
    } finally {
      setPasswordStatus("done");
    }
  }

  async function handleDeleteAccount() {
    if (!token || deleteConfirmText !== "ELIMINAR" || !deletePassword || deleteStatus === "deleting") return;
    setDeleteStatus("deleting");
    setDeleteFeedback(null);
    try {
      await api.deleteAccount(token, deletePassword);
      logout();
      router.push("/");
    } catch (err) {
      setDeleteFeedback(err instanceof ApiError ? err.message : "No se pudo eliminar la cuenta.");
      setDeleteStatus("idle");
    }
  }

  return (
    <div className="mt-10 glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white">Mi cuenta</h2>
      <p className="mt-1 text-xs text-slate-400">{user.email}</p>

      <form onSubmit={handleSaveName} className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={nameStatus === "saving" || !name.trim()}
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {nameStatus === "saving" ? "Guardando..." : "Guardar nombre"}
        </button>
      </form>
      {nameFeedback && <p className="mt-2 text-xs text-slate-400">{nameFeedback}</p>}

      <form onSubmit={handleChangePassword} className="mt-6 grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
            Contraseña actual
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
            Nueva contraseña
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={passwordStatus === "saving" || !currentPassword || !newPassword}
          className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {passwordStatus === "saving" ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>
      {passwordFeedback && <p className="mt-2 text-xs text-slate-400">{passwordFeedback}</p>}

      <div className="mt-8 rounded-xl border border-rose-400/20 bg-rose-400/5 p-4">
        <h3 className="text-sm font-semibold text-rose-300">Eliminar cuenta</h3>
        <p className="mt-1 text-xs text-slate-400">
          Es permanente: perderás acceso a tus chats, imágenes y suscripción. No se puede deshacer.
        </p>

        {!confirmingDelete ? (
          <button
            onClick={() => setConfirmingDelete(true)}
            className="mt-3 rounded-full border border-rose-400/30 px-4 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-400/10"
          >
            Eliminar mi cuenta
          </button>
        ) : (
          <div className="mt-3 space-y-2">
            <input
              type="password"
              placeholder="Tu contraseña"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-rose-400/50 focus:outline-none"
            />
            <input
              placeholder='Escribe "ELIMINAR" para confirmar'
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-rose-400/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "ELIMINAR" || !deletePassword || deleteStatus === "deleting"}
                className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleteStatus === "deleting" ? "Eliminando..." : "Eliminar definitivamente"}
              </button>
              <button
                onClick={() => {
                  setConfirmingDelete(false);
                  setDeletePassword("");
                  setDeleteConfirmText("");
                  setDeleteFeedback(null);
                }}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancelar
              </button>
            </div>
            {deleteFeedback && <p className="text-xs text-rose-400">{deleteFeedback}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
