import Image from "next/image";
// auth
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { redirect } from "next/navigation";
// components
import Button from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import DocumentGrid from "@/components/DocumentGrid";
import NewDocumentForm from "@/components/forms/NewDocumentForm";
// utils
import { HydratedDocument } from "mongoose";
import { DocumentModel, IDocument } from "@/model/document";
import initMongoose from "@/lib/db/db";
import FaceDetection from "@/components/face-detection/FaceDetection";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!session.user.image) {
    console.log("No face image");
  }

  return (
    <main className="min-h-[calc(100vh-70px)]">
      <section className="container-md">
        <header className="py-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold text-black">
              Face detection - {session?.user.username}
            </h3>
            <p className="text-sm text-zinc-700"></p>
          </div>
        </header>
        <FaceDetection />
      </section>
    </main>
  );
}
