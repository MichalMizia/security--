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
import { emailValidationSchema } from "@/lib/validations/emailValidation";
import axios from "axios";
import { validateError } from "@/lib/validateError";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type FormData = z.infer<typeof userLoginSchema>;

export function FaceUpdateForm({ className, ...props }: UserAuthFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(emailValidationSchema),
  });
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    try {
      await axios.post("/api/auth/send-update-face-email", {
        email: data.email.toLowerCase(),
      });
    } catch (e) {
      const message = validateError(e, "Something went wrong");
      return toast.error(message);
    } finally {
      setIsLoading(false);
    }

    toast.success(
      "Face reupload enabled for 1 hour, check your email for further instructions."
    );
  }

  return (
    <div className="flex-1 self-center py-10 min-h-full flex items-center">
      <div className="mx-auto flex w-[94%] max-w-[350px] flex-col justify-center space-y-4">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-black">
            Update Face for 2-factor authentication
          </h1>
          <p className="px-8 text-center text-sm text-slate-500">
            Type in your email, you will receive a link to a reset page for Face
            Image that is then used for 2-factor authentication.
          </p>
        </div>

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
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
              required
            />
            {errors?.email && (
              <p className="px-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit
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

        <p className="px-8 text-center text-sm text-slate-500">
          <Link
            href="/authorize-face"
            className="underline decoration-current decoration-1 transition-all hover:opacity-80"
          >
            Authorize current face
          </Link>
        </p>
      </div>
    </div>
  );
}
