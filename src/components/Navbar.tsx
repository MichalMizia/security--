import Link from "next/link";
import Button from "./ui/button";
import authOptions from "@/lib/auth";
import LoginButton from "./forms/LoginButton";
import { getServerSession } from "next-auth";

interface NavbarProps {}

const Navbar = async ({}: NavbarProps) => {
  const session = await getServerSession(authOptions);
  return (
    <header className="py-4 border-b bg-white border-black/30 shadow-md">
      <div className="flex container-md items-center justify-between">
        <p className="font-[600] text-lg">
          Security<span className="text-dark-blue">++</span>
        </p>
        <nav className="flex items-center justify-end">
          <LoginButton session={session} />
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
