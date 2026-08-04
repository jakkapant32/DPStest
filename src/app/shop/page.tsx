import { getProducts } from "@/lib/store";
import { ShopClient } from "./ShopClient";

export const metadata = {
  title: "ร้านค้า",
};

export default async function ShopPage() {
  const products = await getProducts();
  return <ShopClient initialProducts={products} />;
}
