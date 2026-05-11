import { tileResponse } from "@/lib/server/demo-assets";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ tile?: string[] }> }) {
  const { tile = [] } = await context.params;
  return tileResponse(tile);
}
