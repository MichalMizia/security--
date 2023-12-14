import { JWT } from "next-auth/jwt";
import initMongoose from "./db/db";
import User, { IUser, UserType } from "@/model/user";

import Credentials from "next-auth/providers/credentials";
import { NextAuthOptions, Session } from "next-auth";
// import { GetSessionParams } from "next-auth/react";
import { HydratedDocument } from "mongoose";

const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 3 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 3 * 24 * 60 * 60,
  },
  // Here we add our login providers
  providers: [
    Credentials({
      name: "credentials",
      // The credentials object is what's used to generate Next Auths default login page - We will not use it however.
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Authorize callback is ran upon calling the signin function
      // @ts-expect-error
      async authorize(credentials, req) {
        await initMongoose();

        // Try to find the user and also return the password field
        const user: HydratedDocument<IUser> | null = await User.findOne({
          email: credentials?.email,
        });

        if (!user) {
          throw new Error("No user with a matching email was found.");
        }

        // Use the comparePassword method we defined in our user.js Model file to authenticate
        // @ts-expect-error
        const pwValid = await user.comparePassword(credentials?.password);

        if (!pwValid) {
          throw new Error("Your password is invalid");
        }

        return user;
      },
    }),
  ],
  // All of this is just to add user information to be accessible for our app in the token/session
  callbacks: {
    // We can pass in additional information from the user document MongoDB returns
    // This could be avatars, role, display name, etc...
    async jwt({ token, user, session, trigger }) {
      if (trigger == "signIn") {
        token.isFaceAuthorized = false;
      }
      if (user) {
        token.image = user.image;
        token.email = user.email;
        token._id = user._id;
        token.username = user.username;
      }

      // If more than a certain period of time has passed, set the boolean value back to false
      if (
        token.isFaceAuthorized &&
        Date.now() - Number(token.isFaceAuthorizedSetAt) > 1000 * 60 * 60 // 60 minutes is the max time for the face auth
      ) {
        token.isFaceAuthorized = false;
      }

      if (trigger === "update") {
        if (session?.image?.length) {
          token.image = session.image;
        }

        if (session?.resetFaceAuthorization) {
          token.isFaceAuthorized = false;
          token.isFaceAuthorizedSetAt = undefined;
        }

        // If the isFaceAuthorized value is set to true, store the current timestamp
        if (session?.isFaceAuthorized) {
          token.isFaceAuthorized = true;
          token.isFaceAuthorizedSetAt = Date.now();
        }
      }

      return token;
    },
    // If we want to access our extra user info from sessions we have to pass it the token here to get them in sync:
    async session({ session, token }: { session: any; token: JWT }) {
      if (token && session.user) {
        session.user._id = token._id;
        session.user.username = token.username;
        session.user.email = token.email;
        session.user.image = token.image;

        session.user.isFaceAuthorized = token.isFaceAuthorized || false;
      }
      return session;
    },
  },
  pages: {
    // Custom pages for login, recover password, etc.
    signIn: "/login",
  },
};

export default authOptions;

// export const getSessionParams: GetSessionParams = {
//   req: authOptions,
// };
