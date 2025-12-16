import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { isAdmin, getLibraryGrants } from "@/lib/permissions";
import dbConnect from "@/lib/db";
import User from "@/models/User";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      allowedLibraries: string[];
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
      },
      async authorize(credentials) {
        if (credentials?.email) {
            // In a real app we'd verify password or token. Here we mock OIDC behavior.
            return { id: "mock-id", name: "Test User", email: credentials.email, image: "" };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user }) {
      await dbConnect();
      if (user.email) {
        await User.findOneAndUpdate(
          { email: user.email },
          {
            name: user.name,
            image: user.image,
          },
          { upsert: true, new: true }
        );
      }
      return true;
    },
    async session({ session }) {
      if (session.user && session.user.email) {
        session.user.role = isAdmin(session.user.email) ? 'ADMIN' : 'USER';
        session.user.allowedLibraries = getLibraryGrants(session.user.email);

         await dbConnect();
         const dbUser = await User.findOne({ email: session.user.email });
         if (dbUser) {
             session.user.id = dbUser._id.toString();
         }
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  }
};
