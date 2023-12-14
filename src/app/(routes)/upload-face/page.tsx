// auth
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { redirect } from "next/navigation";
// components
import FaceUpload from "@/components/face-detection/FaceUpload";
// utils

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-[calc(100vh-70px)]">
      <section className="container-md">
        <header className="py-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold text-black">
              Upload face image - {session?.user.username}
            </h3>
            <p className="text-sm text-zinc-700">
              This will be used later for authorization purposes when accessing
              documents.
            </p>
          </div>
        </header>
        <FaceUpload />
      </section>
    </main>
  );
}
