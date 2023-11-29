"use client";

import { Link } from "lucide-react";
import Button from "../ui/button";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

interface LoginButtonProps {
  session: Session | null;
}

const LoginButton = ({ session }: LoginButtonProps) => {
  const handleSignOut = async () => {
    await signOut();

    toast.success("Signed out successfuly");
  };

  if (session) {
    return <Button onClick={async () => handleSignOut()}>Sign Out</Button>;
  }

  return (
    <Button>
      <Link href="/signup">Sign Up</Link>
    </Button>
  );
};

export default LoginButton;
