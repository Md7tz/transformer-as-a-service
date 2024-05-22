import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export default withAuth(
  function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const token = req.cookies.get("next-auth.session-token");

    // Check if user is authenticated
    if (!token) {
      // Redirect to login if not authenticated
      url.pathname = "/signin";
      return NextResponse.redirect(url);
    }

    // Allow the request if authenticated
    return NextResponse.next();
  },
  {
    secret: process.env.NEXT_PUBLIC_JWT_SECRET,
    callbacks: {
      authorized: ({ token }) => !!token, // Only allow access if the token exists
    },
  }
);

export const config = {
  matcher: ["/playground"], // Adjust this to match your protected routes
};