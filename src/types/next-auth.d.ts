import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      shareId?: string | null;
      subscriptionStatus?: string;
      subscriptionCurrentPeriodEnd?: Date | null;
      onboardingCompleted?: boolean;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
