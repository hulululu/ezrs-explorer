// lib/api/products.ts
import type { Product } from "@/types";
import { apiGet } from "./client";

export async function fetchProducts(): Promise<Product[]> {
  const data = await apiGet<{ products: Product[] }>("/api/products");
  return data.products;
}
