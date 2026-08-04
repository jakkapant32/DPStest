"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card, Button, Badge } from "@/components/ui/Card";
import type { Product } from "@/lib/types";

const emptyProduct: Omit<Product, "id"> = {
  name: "",
  description: "",
  price: 0,
  image: "",
  category: "",
  inStock: true,
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Omit<Product, "id"> & { id?: string }>(emptyProduct);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/products");
    setProducts(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    const isEdit = !!form.id;
    await fetch("/api/admin/products", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm(emptyProduct);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("ลบสินค้านี้?")) return;
    await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการสินค้า</h1>
          <p className="text-gray-500">{products.length} รายการ</p>
        </div>
        <Button onClick={() => { setForm(emptyProduct); setShowForm(true); }}>
          <Plus className="mr-1 h-4 w-4" /> เพิ่ม
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6" title={form.id ? "แก้ไขสินค้า" : "เพิ่มสินค้า"}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="ชื่อสินค้า" value={form.name} onChange={(v) => setForm({ ...form, name: v })} className="sm:col-span-2" />
            <Field label="รายละเอียด" value={form.description} onChange={(v) => setForm({ ...form, description: v })} className="sm:col-span-2" />
            <Field label="ราคา (บาท)" type="number" value={String(form.price)} onChange={(v) => setForm({ ...form, price: parseFloat(v) || 0 })} />
            <Field label="หมวดหมู่" value={form.category} onChange={(v) => setForm({ ...form, category: v })} />
            <Field label="URL รูปภาพ" value={form.image} onChange={(v) => setForm({ ...form, image: v })} className="sm:col-span-2" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.inStock} onChange={(e) => setForm({ ...form, inStock: e.target.checked })} className="rounded" />
              มีสินค้าในสต็อก
            </label>
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
                <th className="px-4 py-3">หมวด</th>
                <th className="px-4 py-3">ราคา</th>
                <th className="px-4 py-3">สต็อก</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category}</td>
                  <td className="px-4 py-3">฿{p.price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.inStock ? "completed" : "default"}>
                      {p.inStock ? "มีสินค้า" : "หมด"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setForm(p); setShowForm(true); }} className="rounded p-1 text-gray-400 hover:text-brand-600"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="rounded p-1 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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

function Field({ label, value, onChange, type = "text", className }: { label: string; value: string; onChange: (v: string) => void; type?: string; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-gray-600">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
    </div>
  );
}
