import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase, User } from "./mongodb";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
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

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        }).select("+password");

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.password) {
          throw new Error(
            "This account uses social login. Please sign in with Google or Apple."
          );
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValidPassword) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
          image: user.profileImageUrl || null,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "apple") {
        try {
          await connectToDatabase();

          const email = user.email?.toLowerCase();
          if (!email) return false;

          // Check if user exists by OAuth ID
          let existingUser = await User.findOne({
            oauthId: account.providerAccountId,
            oauthProvider: account.provider,
          });

          if (!existingUser) {
            // Check if user exists by email
            existingUser = await User.findOne({ email });

            if (existingUser) {
              // Link OAuth to existing email account
              await User.findByIdAndUpdate(existingUser._id, {
                $set: {
                  oauthId: account.providerAccountId,
                  oauthProvider: account.provider,
                  profileImageUrl: user.image || existingUser.profileImageUrl,
                  firstName:
                    (profile as { given_name?: string })?.given_name ||
                    user.name?.split(" ")[0] ||
                    existingUser.firstName,
                  lastName:
                    (profile as { family_name?: string })?.family_name ||
                    user.name?.split(" ").slice(1).join(" ") ||
                    existingUser.lastName,
                  updatedAt: new Date(),
                },
              });
            } else {
              // Create new user
              await User.create({
                email,
                oauthId: account.providerAccountId,
                oauthProvider: account.provider,
                firstName:
                  (profile as { given_name?: string })?.given_name ||
                  user.name?.split(" ")[0] ||
                  null,
                lastName:
                  (profile as { family_name?: string })?.family_name ||
                  user.name?.split(" ").slice(1).join(" ") ||
                  null,
                profileImageUrl: user.image || null,
                referralCode: generateReferralCode(),
                shareId: crypto.randomBytes(8).toString("hex"),
                onboardingCompleted: false,
              });
            }
          } else {
            // Update existing OAuth user
            await User.findByIdAndUpdate(existingUser._id, {
              $set: {
                profileImageUrl: user.image || existingUser.profileImageUrl,
                updatedAt: new Date(),
              },
            });
          }

          return true;
        } catch (error) {
          console.error("OAuth signIn error:", error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }

      // For OAuth, get the MongoDB user ID
      if (account?.provider === "google" || account?.provider === "apple") {
        await connectToDatabase();
        const dbUser = await User.findOne({
          oauthId: account.providerAccountId,
          oauthProvider: account.provider,
        });
        if (dbUser) {
          token.id = dbUser._id.toString();
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as { id: string }).id = token.id as string;

        // Fetch additional user data from MongoDB
        await connectToDatabase();
        const dbUser = await User.findById(token.id).lean();

        if (dbUser) {
          session.user.email = dbUser.email;
          session.user.name =
            `${dbUser.firstName || ""} ${dbUser.lastName || ""}`.trim() ||
            session.user.name;
          session.user.image = dbUser.profileImageUrl || session.user.image;
          (session.user as Record<string, unknown>).firstName = dbUser.firstName;
          (session.user as Record<string, unknown>).lastName = dbUser.lastName;
          (session.user as Record<string, unknown>).shareId = dbUser.shareId;
          (session.user as Record<string, unknown>).subscriptionStatus =
            dbUser.subscriptionStatus || "free";
          (session.user as Record<string, unknown>).subscriptionCurrentPeriodEnd =
            dbUser.subscriptionCurrentPeriodEnd;
          (session.user as Record<string, unknown>).onboardingCompleted =
            dbUser.onboardingCompleted;
        }
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
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
