"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { userLoginSchema } from "@/lib/validations/loginValidation";
import { useState } from "react";
import Button from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type FormData = z.infer<typeof userLoginSchema>;

export function LoginForm({ className, ...props }: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userLoginSchema),
  });

  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const searchParams = useSearchParams();

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    const signInResult = await signIn("credentials", {
      email: data.email.toLowerCase(),
      password: data.password,
      redirect: false,
      callbackUrl: searchParams?.get("from") || "/",
    });

    setIsLoading(false);

    if (!signInResult?.ok) {
      if (signInResult?.error) {
        return toast.error(signInResult.error);
      }
      return toast.error("Something went wrong during login");
    }

    toast.success("Logged In");
    router.refresh();
    router.push(searchParams?.get("from") || "/");
  }

  return (
    <div className="flex-1 self-center py-10 min-h-full flex items-center">
      <div className="m-auto flex w-[94%] max-w-[350px] flex-col justify-center space-y-4">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Login to your account
          </h1>
          <p className="px-8 text-center text-sm text-slate-500"></p>
        </div>
        <div className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-2">
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                id="email"
                placeholder="name@example.com"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {errors?.email && (
                <p className="px-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="mb-2">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                type="password"
                {...register("password")}
                id="password"
                placeholder="•••••••••"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                disabled={isLoading}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                required
              />
              {errors?.password && (
                <p className="px-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-bg px-2 text-slate-600 bg-zinc-100">OR</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Button variant="default" className="w-full">
              <Link href="/signup" title="Sign Up">
                Create a New Account
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
