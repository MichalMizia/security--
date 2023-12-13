"use client";

import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { SessionProvider } from "next-auth/react";
import { ReactNode, useEffect, useState } from "react";
import { ToastBar, Toaster, toast } from "react-hot-toast";

interface ProvidersProps {
  children: ReactNode;
}

const Providers = ({ children }: ProvidersProps) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Apply the animation styles after the component has mounted
    const animationTimeout = setTimeout(() => {
      setActive(true);
    }, 100); // Add a slight delay to ensure the styles apply after the initial render

    return () => {
      clearTimeout(animationTimeout);
    };
  }, []);

  return (
    <SessionProvider>
      <Toaster position="top-center" reverseOrder={false}>
        {(t) => <ToastBar toast={t}></ToastBar>}
      </Toaster>
      <div className={`animate-container ${active ? "active" : ""}`}>
        {children}
      </div>
    </SessionProvider>
  );
};

export default Providers;
