"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, ShoppingCart } from "lucide-react";
import { Badge, Button } from "@/components/ui/Card";
import type { Product } from "@/lib/types";
import { useState } from "react";

export function ShopClient({ initialProducts }: { initialProducts: Product[] }) {
  const [cart, setCart] = useState<string[]>([]);

  return (
    <div className="bg-dps-dark min-h-screen text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-end justify-between md:flex-row">
          <div>
            <h2 className="font-bebas mb-2 text-2xl tracking-widest text-dps-cyan">
              MERCHANDISE
            </h2>
            <h1 className="text-3xl font-bold md:text-5xl">
              DPS OFFICIAL <span className="font-bebas tracking-wider">STORE</span>
            </h1>
            <p className="mt-2 text-slate-400">
              สินค้าที่ระลึกและสปอร์ตแฟชั่น สำหรับคนรักกีฬาว่ายน้ำ
            </p>
          </div>
          {cart.length > 0 && (
            <Badge>
              <ShoppingCart className="mr-1 h-3 w-3" />
              {cart.length} รายการ
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {initialProducts.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-2xl bg-slate-800 transition-all hover:ring-1 hover:ring-dps-cyan/50"
            >
              <div className="relative flex h-64 items-center justify-center overflow-hidden bg-slate-700 p-8">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                    <span className="rounded-full bg-dps-cyan px-3 py-1 text-xs font-bold text-dps-navy">
                      SOLD OUT
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <span className="text-xs font-bold uppercase tracking-wide text-dps-cyan">
                  {product.category}
                </span>
                <h3 className="mt-1 text-lg font-bold transition-colors group-hover:text-dps-cyan">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-slate-400">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold">฿{product.price.toLocaleString()}</span>
                  <button
                    disabled={!product.inStock}
                    onClick={() => setCart((prev) => [...prev, product.id])}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 transition-colors hover:bg-dps-cyan hover:text-dps-navy disabled:opacity-40"
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-slate-700 bg-slate-800/50 p-8 sm:flex-row">
          <MessageCircle className="h-10 w-10 shrink-0 text-dps-cyan" />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-semibold">สั่งซื้อผ่าน Line</h3>
            <p className="mt-1 text-sm text-slate-400">Line: @dps-swimming</p>
          </div>
          <Button variant="primary">Line: @dps-swimming</Button>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-slate-400 transition-colors hover:text-dps-cyan"
          >
            กลับหน้าแรก <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
