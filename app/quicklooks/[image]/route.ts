import { quicklookResponse } from "@/lib/server/demo-assets";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ image: string }> }) {
  const { image } = await context.params;
  return quicklookResponse([image]);
}
