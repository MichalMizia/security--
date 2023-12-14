import { DefaultSession, DefaultUser, Session, User } from "next-auth";
import { DefaultJWT, JWT } from "next-auth/jwt";

interface IUser extends Omit<DefaultUser, "name" | "id"> {
  _id: string;
  username: string;
  image?: string;
  isFaceAuthorized: boolean;
  isFaceAuthorizedSetAt?: Date | null;
}

declare module "next-auth" {
  interface User extends Omit<DefaultUser, "name" | "id"> {
    _id: string;
    username: string;
    image?: string;
    isFaceAuthorized: boolean;
  }

  interface Session extends Omit<DefaultSession, "user"> {
    user: User;
  }
}

declare module "next-auth/JWT" {
  interface JWT extends IUser {
    isFaceAuthorized: boolean;
  }
}
