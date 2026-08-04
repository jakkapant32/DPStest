"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, Button, Badge } from "@/components/ui/Card";
import type { EventStatus, SwimEvent } from "@/lib/types";

const emptyEvent: Omit<SwimEvent, "id"> = {
  name: "",
  dateStart: "",
  dateEnd: "",
  venue: "",
  city: "",
  status: "upcoming",
  description: "",
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<SwimEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<SwimEvent, "id"> & { id?: string }>(emptyEvent);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/events");
    setEvents(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    const isEdit = !!form.id;
    await fetch("/api/admin/events", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm(emptyEvent);
    await load();
    setSaving(false);
  };

  const handleEdit = (event: SwimEvent) => {
    setForm(event);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบการแข่งขันนี้?")) return;
    await fetch(`/api/admin/events?id=${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการการแข่งขัน</h1>
          <p className="text-gray-500">{events.length} รายการ</p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyEvent);
            setShowForm(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" /> เพิ่ม
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6" title={form.id ? "แก้ไขการแข่งขัน" : "เพิ่มการแข่งขัน"}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อการแข่งขัน" value={form.name} onChange={(v) => setForm({ ...form, name: v })} className="sm:col-span-2" />
            <Field label="วันเริ่ม" type="date" value={form.dateStart} onChange={(v) => setForm({ ...form, dateStart: v })} />
            <Field label="วันสิ้นสุด" type="date" value={form.dateEnd} onChange={(v) => setForm({ ...form, dateEnd: v })} />
            <Field label="สถานที่" value={form.venue} onChange={(v) => setForm({ ...form, venue: v })} />
            <Field label="เมือง" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">สถานะ</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as EventStatus })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <Field label="รายละเอียด" value={form.description ?? ""} onChange={(v) => setForm({ ...form, description: v })} className="sm:col-span-2" />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={handleSave} disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึก"}</Button>
            <Button variant="outline" onClick={() => setShowForm(false)}>ยกเลิก</Button>
          </div>
        </Card>
      )}

      <Card className="mt-6 overflow-x-auto p-0">
        {loading ? (
          <p className="p-6 text-gray-400">กำลังโหลด...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-600">
                <th className="px-4 py-3">ชื่อ</th>
                <th className="px-4 py-3">วันที่</th>
                <th className="px-4 py-3">สถานที่</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium">{e.name}</td>
                  <td className="px-4 py-3 text-gray-500">{e.dateStart}</td>
                  <td className="px-4 py-3 text-gray-500">{e.city}</td>
                  <td className="px-4 py-3"><Badge variant={e.status}>{e.status}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(e)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-brand-600"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(e.id)} className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
