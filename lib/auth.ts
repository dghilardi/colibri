import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { isAdmin, getLibraryGrants } from "@/lib/permissions";
import dbConnect from "@/lib/db";
import User from "@/models/User";

interface ComelitProfile {
  data: {
    firstName?: string;
    lastName?: string;
    loginEmail: string;
    userShortId: string | number;
    profilePictureUrl?: string;
  };
}

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
    }),
    {
      id: "comelit",
      name: "Comelit",
      type: "oauth",
      clientId: process.env.COMELIT_CLIENT_ID,
      clientSecret: process.env.COMELIT_CLIENT_SECRET,
      authorization: {
        url: "https://usvc-preprod.cloud.comelitgroup.com/o-auth-2/authorize",
        params: { scope: "read:user user:email" },
      },
      token: "https://usvc-preprod.cloud.comelitgroup.com/o-auth-2/token",
      userinfo: "https://usvc-preprod.cloud.comelitgroup.com/servicerest/user/portal/getmyprofile",
      profile(profile: ComelitProfile) {
        const name = profile.data.firstName && profile.data.lastName 
            ? `${profile.data.firstName} ${profile.data.lastName}`
            : profile.data.firstName ? profile.data.firstName
            : profile.data.lastName ? profile.data.lastName
            : profile.data.loginEmail.split('@')[0];
        
        return {
            id: `${profile.data.userShortId}`,
            name,
            email: profile.data.loginEmail,
            image: profile.data.profilePictureUrl,
        }
      },
    },
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : [])
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
