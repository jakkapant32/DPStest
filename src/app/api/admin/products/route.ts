import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/auth";
import { generateId, getProducts, saveProducts } from "@/lib/store";
import type { Product } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  return NextResponse.json(await getProducts());
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  const body = (await request.json()) as Omit<Product, "id">;
  const products = await getProducts();
  const newProduct: Product = { ...body, id: generateId("p") };
  await saveProducts([newProduct, ...products]);
  return NextResponse.json(newProduct, { status: 201 });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  const body = (await request.json()) as Product;
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  products[idx] = body;
  await saveProducts(products);
  return NextResponse.json(body);
}

export async function DELETE(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorizedResponse();
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const products = await getProducts();
  await saveProducts(products.filter((p) => p.id !== id));
  return NextResponse.json({ success: true });
}
