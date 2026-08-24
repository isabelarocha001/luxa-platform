import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (e) {
    // Last line of defense — never 500 the whole edge
    console.error(
      JSON.stringify({
        level: "error",
        scope: "middleware.root",
        message: e instanceof Error ? e.message : "middleware crashed",
      }),
    );
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    /*
     * Skip static assets & Next internals so a bad middleware
     * cannot take down CSS/JS/images either.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
