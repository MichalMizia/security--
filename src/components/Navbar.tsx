import Link from "next/link";
import Button from "./ui/button";

interface NavbarProps {}

const Navbar = ({}: NavbarProps) => {
  return (
    <header className="py-4 border-b border-black/30 shadow-md">
      <div className="flex container-md items-center justify-between">
        <span className="font-[600] text-lg">Security++</span>
        <nav className="flex items-center justify-end">
          <Button>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
