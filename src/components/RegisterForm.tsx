"use client";

// components
import Button from "@/components/ui/button";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
// types
import { userRegisterSchema } from "@/lib/validations/registerValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodError, z } from "zod";
// utils
import axios, { AxiosError } from "axios";
// hooks
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface RegisterFormProps {}

type FormData = z.infer<typeof userRegisterSchema>;

const RegisterForm = ({}: RegisterFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userRegisterSchema),
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      const res = await axios.post("/api/signup", {
        username: data.username,
        email: data.email.toLowerCase(),
        password: data.password,
      });
      console.log(res);
    } catch (e) {
      if (
        e instanceof AxiosError &&
        e.response?.status?.toString()[0] === "4" &&
        e.response?.data?.message
      ) {
        toast.error(e.response.data.message);
        return null;
      } else if (e instanceof ZodError) {
        toast.error("Form filled out incorrectly");
        return null;
      } else {
        toast.error("Something went wrong during registration");
        return null;
      }
    } finally {
      setIsLoading(false);
    }

    toast.success("Zarejestrowano użytkownika");
    router.refresh();
    router.push("/login");
  }

  return (
    <div className="flex-1 self-center py-10">
      <div className="mx-auto flex w-[94%] max-w-[350px] flex-col justify-center space-y-4">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Create an account
          </h1>
          <p className="px-8 text-center text-sm text-slate-500"></p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-2">
            <label htmlFor="name" className="sr-only">
              Username
            </label>
            <input
              type="text"
              {...register("username")}
              id="name"
              placeholder="Username"
              autoCapitalize="none"
              autoComplete="name"
              autoCorrect="off"
              disabled={isLoading}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            {errors?.username && (
              <p className="px-1 text-xs text-red-600">
                {errors.username.message}
              </p>
            )}
          </div>
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
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
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
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
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
            Create an account
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg px-2 text-slate-600">OR</span>
          </div>
        </div>

        <p className="px-8 text-center text-sm text-slate-500">
          <Link
            href="/login"
            className="underline decoration-current decoration-1 transition-all hover:opacity-80"
          >
            Already have an account? Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
