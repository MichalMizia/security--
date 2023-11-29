import { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Login - Security++",
  description: "Login to your security++ account",
};

export default function Page() {
  return (
    <main>
      <section className="h-[calc(100vh-70px)] items-center">
        <LoginForm />
      </section>
    </main>
  );
}
