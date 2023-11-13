import { VariantProps, cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export const buttonVariants = cva(
  "active:scale-95 rounded-md items-center justify-center text-sm font-medium transition-all duration-300 inline-flex focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:opacity-75 disabled:brightness-90 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-slate-950 text-white hover:bg-slate-800",
        inverse: "bg-slate-50 text-black hover:bg-slate-200",
        text: "hover:bg-slate-200",
        primary:
          "bg-blue-500 rounded-[4px] text-white hover-circle-overlay border-blue-500 border-2 relative overflow-hidden",
        primary_outlined:
          "bg-slate-100 rounded-[4px] border-2 text-black border-solid border-blue-500 hover:bg-slate-200 transition-colors",
        outlined:
          "bg-slate-100 border-2 border-solid border-slate-200 hover:bg-slate-200 hover:border-slate-300 transition-colors",
      },
      size: {
        default: "py-2 px-4",
        large: "py-3 px-6",
        small: "py-1.5 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className!)}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
