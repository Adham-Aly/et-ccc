// app/search-index.json/route.ts — the only route handler in the app (plan §4.8, A3). Static
// JSON built at build time; MiniSearch loads it lazily on the client (lib/search/client.ts).
import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/search/build-index";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(buildSearchIndex());
}
