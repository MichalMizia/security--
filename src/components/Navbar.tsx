import Link from "next/link";
import Button from "./ui/button";
import authOptions from "@/lib/auth";
import LoginButton from "./forms/LoginButton";
import { getServerSession } from "next-auth";
import Image from "next/image";

interface NavbarProps {}

const Navbar = async ({}: NavbarProps) => {
  const session = await getServerSession(authOptions);

  const initials = session?.user.username
    ?.split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <header className="py-4 border-b bg-white border-black/30 shadow-md">
      <div className="flex container-md items-center justify-between">
        <div className="flex items-center justify-start gap-3">
          {session?.user.image && (
            <div className="flex relative aspect-square h-10 overflow-hidden items-center justify-center rounded-full border border-violet-300 bg-blue-400 p-1 shadow-lg shadow-[#00000030]">
              <img
                alt="Avatar"
                src={session?.user.image}
                className="w-full h-full inset-0 absolute z-10"
              />
            </div>
          )}
          <a href="/" className="font-[600] text-lg">
            Security<span className="text-dark-blue">++</span>
          </a>
        </div>
        <nav className="flex items-center justify-end">
          <ul className="flex mr-2 items-center justify-end">
            <li className="">
              <Button variant="text">
                <a href="/face-upload">Face Upload</a>
              </Button>
            </li>
            <li className="">
              <Button variant="text">
                <a href="/face">Face Detection</a>
              </Button>
            </li>
          </ul>
          <LoginButton session={session} />
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
