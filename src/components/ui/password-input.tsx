import * as React from "react";

import { cn } from "@/lib/utils";
import Button from "./button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, type, ...props }, ref) => {
    const [passwordVisible, setPasswordVisible] =
      React.useState<boolean>(false);

    return (
      <div className="relative w-full">
        <input
          className={cn(
            "flex w-full border-black/30 p-1 rounded-sm border bg-white ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300",
            className
          )}
          ref={ref}
          {...props}
          type={passwordVisible ? "text" : "password"}
          name="password"
          autoComplete="current-password"
          required
          minLength={4}
        />
        <Button
          type="button"
          className="absolute rounded-l-none border-l border-black/20 rounded-r-sm h-[calc(100%-2px)] right-[1px] top-[1px] bottom-[1px] aspect-square"
          variant="text"
          onClick={() => setPasswordVisible((prev) => !prev)}
        >
          {passwordVisible ? <EyeIcon /> : <EyeOffIcon />}
        </Button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
