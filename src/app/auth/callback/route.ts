import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

function safeNext(value: string | null, origin: string): URL {
  if (value && value.startsWith("/") && !value.startsWith("//")) {
    return new URL(value, origin);
  }
  return new URL("/studio", origin);
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;
  const destination = safeNext(url.searchParams.get("next"), origin);
  if (!code) return NextResponse.redirect(new URL("/sign-in?auth=missing_code", origin));

  const response = NextResponse.redirect(destination);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) return NextResponse.redirect(new URL("/sign-in?auth=not_configured", origin));

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Parameters<typeof response.cookies.set>[2] }>) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      }
    }
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/sign-in?auth=callback_failed", origin));
  return response;
}
