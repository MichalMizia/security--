"use client";

import { LinkIcon } from "lucide-react";
import Button from "../ui/button";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import Link from "next/link";

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
      <LinkIcon className="w-4 h-4 mr-2" />
      <Link href="/signup">Sign Up</Link>
    </Button>
  );
};

export default LoginButton;
