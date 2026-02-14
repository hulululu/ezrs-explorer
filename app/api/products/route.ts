// app/api/products/route.ts
import { NextResponse } from "next/server";
import { getMockProducts } from "@/lib/server/mock";

export const dynamic = "force-dynamic"; // 개발 중 캐시 방지

export async function GET() {
  const products = getMockProducts();
  return NextResponse.json({ products });
}
