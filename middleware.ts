import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - auth (Auth routes)
     * - manifest.json (Web App Manifest)
     * - sw.js (Service Worker)
     * - icons (Icon files)
     * - images (Image files)
     * - favicon.ico (Favicon file)
     */
    '/((?!api|auth|manifest.json|sw.js|icons|images|favicon.ico).*)',
  ],
};
