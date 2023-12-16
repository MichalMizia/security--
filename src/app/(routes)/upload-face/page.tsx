// auth
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { redirect } from "next/navigation";
// components
import FaceUpload from "@/components/face-detection/FaceUpload";
import { headers } from "next/headers";
import { FaceUpdateForm } from "@/components/auth/FaceUpdateForm";
// utils

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-[calc(100vh-75px)] flex items-center justify-center">
      <FaceUpdateForm />
    </main>
  );
}
