"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { api, ApiError, type AdminUserResponse, type PlanType, type Role } from "@/lib/api";

const planLabels: Record<PlanType, string> = {
  FREE: "Gratis",
  TRIAL_3_DAYS: "Pase 3 días",
  PREMIUM: "Premium",
  VIP: "VIP",
};

const plans: PlanType[] = ["FREE", "TRIAL_3_DAYS", "PREMIUM", "VIP"];

function CreateAdminForm({ onCreated }: { onCreated: () => void }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("ADMIN");
  const [status, setStatus] = useState<"idle" | "saving">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || status === "saving") return;
    setStatus("saving");
    setFeedback(null);
    try {
      await api.createAdminUser(token, { name, email, password, role });
      setFeedback(`Usuario ${email} creado como ${role}.`);
      setName("");
      setEmail("");
      setPassword("");
      onCreated();
    } catch (err) {
      setFeedback(err instanceof ApiError ? err.message : "No se pudo crear el usuario.");
    } finally {
      setStatus("idle");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="glow-button rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
      >
        + Crear administrador / usuario
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass rounded-2xl p-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          required
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
        />
        <input
          required
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
        />
        <input
          required
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
        >
          <option value="ADMIN">ADMIN</option>
          <option value="USER">USER</option>
        </select>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "saving"}
          className="rounded-full bg-cyan-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "saving" ? "Creando..." : "Crear"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-white/10 px-5 py-2 text-sm font-semibold text-slate-300"
        >
          Cancelar
        </button>
        {feedback && <p className="text-xs text-slate-400">{feedback}</p>}
      </div>
    </form>
  );
}

export default function AdminUsersPage() {
  const { user: currentUser, token } = useAuth();
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  function loadUsers() {
    if (!token) return;
    api
      .getAdminUsers(token)
      .then(setUsers)
      .catch((err) => setError(err instanceof ApiError ? err.message : "No se pudieron cargar los usuarios."));
  }

  useEffect(loadUsers, [token]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, search]);

  async function handleRoleChange(id: number, role: Role) {
    if (!token) return;
    setBusyId(id);
    try {
      const updated = await api.updateAdminUserRole(token, id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "No se pudo cambiar el rol.");
    } finally {
      setBusyId(null);
    }
  }

  async function handlePlanChange(id: number, plan: PlanType) {
    if (!token) return;
    setBusyId(id);
    try {
      const updated = await api.updateAdminUserPlan(token, id, plan);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "No se pudo cambiar el plan.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleToggleActive(id: number, active: boolean) {
    if (!token) return;
    setBusyId(id);
    try {
      const updated = await api.updateAdminUserActive(token, id, active);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "No se pudo actualizar el estado.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number, email: string) {
    if (!token) return;
    if (!window.confirm(`¿Eliminar la cuenta de ${email}? Esta acción no se puede deshacer.`)) return;
    setBusyId(id);
    try {
      await api.deleteAdminUser(token, id);
      loadUsers();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "No se pudo eliminar el usuario.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          placeholder="Buscar por nombre o correo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-white/10 bg-white/5 p-2 text-sm text-white focus:border-cyan-400/50 focus:outline-none"
        />
        <CreateAdminForm onCreated={loadUsers} />
      </div>

      {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-white/5">
        <table className="w-full min-w-[900px] text-sm text-slate-300">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-left text-xs text-slate-400">
              <th className="p-3">Usuario</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Plan</th>
              <th className="p-3 text-right">Créditos</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Creado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((u) => {
              const isSelf = currentUser?.email === u.email;
              const disabled = busyId === u.id;
              return (
                <tr key={u.id} className={!u.active ? "opacity-50" : ""}>
                  <td className="p-3">
                    <p className="font-medium text-white">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      disabled={disabled || isSelf}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                      className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-xs text-white disabled:opacity-50"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="p-3">
                    <select
                      value={u.plan}
                      disabled={disabled}
                      onChange={(e) => handlePlanChange(u.id, e.target.value as PlanType)}
                      className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-xs text-white disabled:opacity-50"
                    >
                      {plans.map((p) => (
                        <option key={p} value={p}>
                          {planLabels[p]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-right font-mono">{u.imageCredits}</td>
                  <td className="p-3">
                    <button
                      disabled={disabled || isSelf}
                      onClick={() => handleToggleActive(u.id, !u.active)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50 ${
                        u.active ? "bg-emerald-400/15 text-emerald-300" : "bg-slate-500/20 text-slate-400"
                      }`}
                    >
                      {u.active ? "Activo" : "Inactivo/eliminado"}
                    </button>
                  </td>
                  <td className="p-3 text-xs text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("es-MX")}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      disabled={disabled || isSelf || !u.active}
                      onClick={() => handleDelete(u.id, u.email)}
                      className="text-xs text-rose-400 underline underline-offset-2 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-sm text-slate-400">
                  No hay usuarios que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
