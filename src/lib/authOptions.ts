import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase, User, Session } from "./mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateAppleClientSecret } from "./appleClientSecret";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: generateAppleClientSecret(),
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await connectToDatabase();
        const user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.password) {
          throw new Error("This account uses social login. Please sign in with Google or Apple.");
        }

        const isValidPassword = await bcrypt.compare(credentials.password, user.password);

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
          image: user.profileImageUrl,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "apple") {
        await connectToDatabase();
        
        const existingUser = await User.findOne({
          $or: [
            { oauthId: account.providerAccountId },
            { email: user.email?.toLowerCase() },
          ],
        });

        if (existingUser) {
          await User.findByIdAndUpdate(existingUser._id, {
            $set: {
              oauthId: account.providerAccountId,
              oauthProvider: account.provider,
              firstName: existingUser.firstName || user.name?.split(' ')[0],
              lastName: existingUser.lastName || user.name?.split(' ').slice(1).join(' '),
              profileImageUrl: existingUser.profileImageUrl || user.image,
              emailVerified: new Date(),
              updatedAt: new Date(),
            },
          });
        } else {
          await User.create({
            oauthId: account.providerAccountId,
            oauthProvider: account.provider,
            email: user.email?.toLowerCase(),
            firstName: user.name?.split(' ')[0],
            lastName: user.name?.split(' ').slice(1).join(' '),
            profileImageUrl: user.image,
            emailVerified: new Date(),
            shareId: crypto.randomBytes(8).toString('hex'),
            referralCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
            onboardingCompleted: false,
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        await connectToDatabase();
        let dbUser;
        
        if (account?.provider === "credentials") {
          dbUser = await User.findById(user.id).lean();
        } else if (account) {
          dbUser = await User.findOne({
            $or: [
              { oauthId: account.providerAccountId },
              { email: user.email?.toLowerCase() },
            ],
          }).lean();
        }

        if (dbUser) {
          token.userId = dbUser._id.toString();
          token.subscriptionStatus = dbUser.subscriptionStatus || 'free';
          token.onboardingCompleted = dbUser.onboardingCompleted || false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        (session.user as any).id = token.userId;
        (session.user as any).subscriptionStatus = token.subscriptionStatus;
        (session.user as any).onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "none",
        path: "/",
        secure: true,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
