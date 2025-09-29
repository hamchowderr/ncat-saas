import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "./database.types";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  // Get full user details to check email confirmation status
  const {
    data: { user: fullUser }
  } = await supabase.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/auth") &&
    request.nextUrl.pathname !== "/"
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Handle email confirmation flow for authenticated but unconfirmed users
  if (user && fullUser && !fullUser.email_confirmed_at) {
    // Allow access to confirmation-related pages
    const allowedPaths = ["/auth/sign-up-success", "/auth/callback", "/auth/login", "/auth/error"];

    if (!allowedPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
      // Redirect unconfirmed users to the sign-up success page
      const url = request.nextUrl.clone();
      url.pathname = "/auth/sign-up-success";
      return NextResponse.redirect(url);
    }
  }

  // Handle onboarding flow for authenticated and confirmed users who need onboarding
  if (user && fullUser && fullUser.email_confirmed_at) {
    try {
      // Check if user needs onboarding by looking at workspace name
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("name")
        .eq("id", user.sub)
        .single();

      // Check if workspace name indicates default/unset state
      const isDefaultName =
        workspace?.name?.endsWith("'s Workspace") ||
        workspace?.name?.endsWith("-workspace") ||
        !workspace?.name;

      // Allow access to onboarding and auth-related pages
      const allowedPaths = [
        "/auth/onboarding",
        "/auth/callback",
        "/auth/login",
        "/auth/error",
        "/auth/sign-up-success"
      ];

      // If user needs onboarding and isn't on an allowed path, redirect to onboarding
      if (
        isDefaultName &&
        !allowedPaths.some((path) => request.nextUrl.pathname.startsWith(path))
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/onboarding";
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // If there's an error checking workspace, allow the request to continue
      console.error("Error checking workspace in middleware:", error);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
