import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};

/**
 * Refresh auth session cookies.
 * Must NEVER throw — a throw here = MIDDLEWARE_INVOCATION_FAILED (500) on Vercel.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    // Env missing on this deployment — skip auth refresh, do not crash the site
    console.error(
      JSON.stringify({
        level: "error",
        scope: "middleware",
        message: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
      }),
    );
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options as never);
          });
        },
      },
    });

    // Touches auth and refreshes tokens; ignore failures
    await supabase.auth.getUser();
  } catch (e) {
    console.error(
      JSON.stringify({
        level: "error",
        scope: "middleware",
        message: e instanceof Error ? e.message : "updateSession failed",
      }),
    );
    return NextResponse.next({ request });
  }

  return supabaseResponse;
}
