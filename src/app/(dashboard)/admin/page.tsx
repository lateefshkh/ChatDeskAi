// src/app/(dashboard)/admin/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data.stats);
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Refund Handler
  async function handleRefund(paymentId: string) {
    if (!paymentId) {
      alert("Is user ki koi successful payment history nahi hai.");
      return;
    }
    if (!confirm(`Refund payment ${paymentId}?`)) return;

    try {
      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId }),
      });
      const data = await res.json();
      if (res.ok) alert(`✅ Refund successful! ID: ${data.refundId}`);
      else alert(`❌ Refund failed: ${data.error}`);
    } catch {
      alert("Error processing refund");
    }
  }

  // Terminate Handler
  async function handleTerminate(tenantId: string, subscriptionId?: string) {
    if (!tenantId) {
      alert("Is user ka koi tenant nahi mila.");
      return;
    }
    if (!confirm("Terminate this user's subscription and reset to free trial?")) return;

    try {
      const res = await fetch("/api/admin/terminate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId, subscriptionId }),
      });
      if (res.ok) {
        alert("✅ Subscription terminated.");
        loadData(); // Refresh
      } else {
        alert("❌ Failed to terminate.");
      }
    } catch {
      alert("Error terminating subscription");
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-text">Loading admin data...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-ink tracking-tight mb-2">Admin Dashboard</h1>
        <p className="text-[17px] text-text">Platform overview and database stats.</p>
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <AdminStat label="Total Users" value={stats?.userCount || 0} />
        <AdminStat label="Total Messages" value={stats?.messageCount || 0} />
        <AdminStat label="Total Chunks" value={stats?.chunkCount || 0} />
        <AdminStat 
          label="Total Revenue" 
          value={`₹${((stats?.revenue || 0) / 100).toLocaleString()}`} 
          highlight 
        />
      </div>

      {/* Users Table */}
      <div className="bg-card rounded-[26px] p-8">
        <h2 className="text-xl font-bold text-ink mb-6">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-divider text-sm text-text">
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-divider last:border-0 text-sm">
                  <td className="py-4 text-ink font-medium">{u.email}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.role === "platform_admin" 
                        ? "bg-red-50 text-red-600" 
                        : "bg-background text-text"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-4 text-text">
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      {/* Refund Button */}
                      <button
                        onClick={() => handleRefund(u.lastPaymentId)}
                        disabled={!u.lastPaymentId}
                        className="text-xs bg-warning/10 text-warning px-3 py-1.5 rounded-lg hover:bg-warning/20 disabled:opacity-50 font-medium"
                        title={u.lastPaymentId ? `Refund ${u.lastPaymentId}` : "No payment found"}
                      >
                        Refund
                      </button>

                      {/* Terminate Button */}
                      <button
                        onClick={() => handleTerminate(u.tenantId, u.subscriptionId)}
                        disabled={!u.tenantId}
                        className="text-xs bg-error/10 text-error px-3 py-1.5 rounded-lg hover:bg-error/20 disabled:opacity-50 font-medium"
                      >
                        Terminate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminStat({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="bg-card rounded-[26px] p-6">
      <p className="text-sm font-medium text-text mb-2">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-primary" : "text-ink"}`}>{value}</p>
    </div>
  );
}