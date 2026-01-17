import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase, User, Session } from "./mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateAppleClientSecret } from "./appleClientSecret";

// Validate required environment variables
function validateEnvVars() {
  const required = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(`Missing required auth environment variables: ${missing.join(", ")}`);
  }
}

validateEnvVars();

// Build providers array dynamically based on available configuration
const providers: NextAuthOptions["providers"] = [];

// Add Google provider if configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    })
  );
} else {
  console.warn("Google OAuth not configured: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing");
}

// Add Apple provider if configured
if (
  process.env.APPLE_ID &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID &&
  process.env.APPLE_PRIVATE_KEY
) {
  try {
    const appleClientSecret = generateAppleClientSecret();
    providers.push(
      AppleProvider({
        clientId: process.env.APPLE_ID,
        clientSecret: appleClientSecret,
      })
    );
  } catch (error) {
    console.error("Failed to configure Apple OAuth:", error);
  }
} else {
  console.warn(
    "Apple OAuth not configured: APPLE_ID, APPLE_TEAM_ID, APPLE_KEY_ID, or APPLE_PRIVATE_KEY missing"
  );
}

// Add Credentials provider
providers.push(
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
  })
);

export const authOptions: NextAuthOptions = {
  providers,
  debug: process.env.NODE_ENV === "development",
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google" || account?.provider === "apple") {
          console.log(`[Auth] OAuth sign-in attempt via ${account.provider}`);
          await connectToDatabase();

          const existingUser = await User.findOne({
            $or: [
              { oauthId: account.providerAccountId },
              { email: user.email?.toLowerCase() },
            ],
          });

          if (existingUser) {
            console.log(`[Auth] Updating existing user: ${user.email}`);
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
            console.log(`[Auth] Creating new user: ${user.email}`);
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
          console.log(`[Auth] OAuth sign-in successful for: ${user.email}`);
        }
        return true;
      } catch (error) {
        console.error("[Auth] Sign-in callback error:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      try {
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
      } catch (error) {
        console.error("[Auth] JWT callback error:", error);
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
  secret: process.env.NEXTAUTH_SECRET,
};
