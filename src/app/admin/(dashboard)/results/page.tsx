"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, Button } from "@/components/ui/Card";
import type { Gender, RaceResult, Stroke, SwimEvent } from "@/lib/types";
import { formatSwimTime } from "@/lib/utils";

const emptyResult: Omit<RaceResult, "id"> = {
  eventId: "",
  category: "",
  stroke: "freestyle",
  distance: 200,
  gender: "female",
  ageGroup: "",
  athleteId: "",
  athleteName: "",
  club: "",
  rank: 1,
  time: 0,
  splits: { "50": 0, "100": 0, "150": 0, "200": 0 },
};

export default function AdminResultsPage() {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [events, setEvents] = useState<SwimEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<RaceResult, "id"> & { id?: string }>(emptyResult);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [rRes, eRes] = await Promise.all([
      fetch("/api/admin/results"),
      fetch("/api/admin/events"),
    ]);
    setResults(await rRes.json());
    setEvents(await eRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    const isEdit = !!form.id;
    await fetch("/api/admin/results", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm(emptyResult);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบผลการแข่งขันนี้?")) return;
    await fetch(`/api/admin/results?id=${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการผลการแข่งขัน</h1>
          <p className="text-gray-500">{results.length} รายการ</p>
        </div>
        <Button onClick={() => { setForm(emptyResult); setShowForm(true); }}>
          <Plus className="mr-1 h-4 w-4" /> เพิ่ม
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6" title={form.id ? "แก้ไขผล" : "เพิ่มผลการแข่งขัน"}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">การแข่งขัน</label>
              <select value={form.eventId} onChange={(e) => setForm({ ...form, eventId: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                <option value="">เลือก...</option>
                {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <Field label="ชื่อนักกีฬา" value={form.athleteName} onChange={(v) => setForm({ ...form, athleteName: v })} />
            <Field label="สโมสร" value={form.club} onChange={(v) => setForm({ ...form, club: v })} />
            <Field label="ประเภท" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            <Field label="รุ่นอายุ" value={form.ageGroup} onChange={(v) => setForm({ ...form, ageGroup: v })} />
            <Field label="อันดับ" type="number" value={String(form.rank)} onChange={(v) => setForm({ ...form, rank: parseInt(v) || 1 })} />
            <Field label="เวลา (วินาที)" type="number" value={String(form.time)} onChange={(v) => setForm({ ...form, time: parseFloat(v) || 0 })} />
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">เพศ</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as Gender })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                <option value="female">หญิง</option>
                <option value="male">ชาย</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600">ท่า</label>
              <select value={form.stroke} onChange={(e) => setForm({ ...form, stroke: e.target.value as Stroke })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">
                <option value="freestyle">Freestyle</option>
                <option value="backstroke">Backstroke</option>
                <option value="breaststroke">Breaststroke</option>
                <option value="butterfly">Butterfly</option>
                <option value="medley">Medley</option>
              </select>
            </div>
            {(["50", "100", "150", "200"] as const).map((d) => (
              <Field
                key={d}
                label={`Split ${d}m`}
                type="number"
                value={String(form.splits[d] ?? 0)}
                onChange={(v) => setForm({ ...form, splits: { ...form.splits, [d]: parseFloat(v) || 0 } })}
              />
            ))}
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
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">นักกีฬา</th>
                <th className="px-4 py-3">ประเภท</th>
                <th className="px-4 py-3">เวลา</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id} className="border-b border-gray-50">
                  <td className="px-4 py-3">{r.rank}</td>
                  <td className="px-4 py-3 font-medium">{r.athleteName}</td>
                  <td className="px-4 py-3 text-gray-500">{r.category}</td>
                  <td className="px-4 py-3 font-mono text-brand-700">{formatSwimTime(r.time)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setForm(r); setShowForm(true); }} className="rounded p-1 text-gray-400 hover:text-brand-600"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(r.id)} className="rounded p-1 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-600">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
    </div>
  );
}
