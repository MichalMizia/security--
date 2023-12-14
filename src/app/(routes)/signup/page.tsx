import { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign Up - Security++",
  description: "Create a new account to get access to all security++ features",
};

export default function Page() {
  return (
    <main>
      <section className="h-[calc(100vh-70px)] items-center">
        <RegisterForm />
      </section>
    </main>
  );
}
