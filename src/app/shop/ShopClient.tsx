"use client";

import Image from "next/image";
import { ShoppingCart, MessageCircle } from "lucide-react";
import { Card, Badge, Button } from "@/components/ui/Card";
import type { Product } from "@/lib/types";
import { useState } from "react";

export function ShopClient({ initialProducts }: { initialProducts: Product[] }) {
  const [cart, setCart] = useState<string[]>([]);

  const addToCart = (id: string) => {
    setCart((prev) => [...prev, id]);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            ร้าน<span className="text-gradient">ค้า</span>
          </h1>
          <p className="mt-2 text-gray-500">อุปกรณ์ว่ายน้ำและ merchandise จาก BlueHub</p>
        </div>
        {cart.length > 0 && (
          <Badge>
            <ShoppingCart className="mr-1 h-3 w-3" />
            {cart.length} รายการ
          </Badge>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {initialProducts.map((product) => (
          <Card key={product.id} className="flex flex-col overflow-hidden p-0">
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-medium">สินค้าหมด</span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              <Badge>{product.category}</Badge>
              <h3 className="mt-2 font-semibold text-gray-900">{product.name}</h3>
              <p className="mt-1 flex-1 text-sm text-gray-500">{product.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-brand-700">฿{product.price.toLocaleString()}</span>
                <Button size="sm" disabled={!product.inStock} onClick={() => addToCart(product.id)}>
                  <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                  เพิ่ม
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-10 flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:text-left">
        <MessageCircle className="h-10 w-10 shrink-0 text-brand-500" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">สั่งซื้อผ่าน Line</h3>
          <p className="mt-1 text-sm text-gray-500">
            Phase 1: ติดต่อสั่งซื้อผ่าน Line @bluehub — Payment online จะมาใน Phase 1.5
          </p>
        </div>
        <Button variant="secondary">Line: @bluehub</Button>
      </Card>
    </div>
  );
}
