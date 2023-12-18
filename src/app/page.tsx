// auth
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { RedirectType, redirect, useRouter } from "next/navigation";
// components
import Button from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import DocumentGrid from "@/components/DocumentGrid";
import NewDocumentForm from "@/components/forms/NewDocumentForm";
// utils
import { DocumentModel, IDocument } from "@/model/document";
import initMongoose from "@/lib/db/db";
import { Suspense } from "react";
import TestButton from "@/../.idea/rand_btn";

const getData = async (id: string): Promise<IDocument[] | null> => {
  await initMongoose();

  const documents: IDocument[] | null = await DocumentModel.find({
    userId: id,
  });

  return documents;
};

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/login`);
  }

  const documents = await getData(session.user._id);

  return (
    <main className="min-h-[calc(100vh-75px)]">
      <section className="container-md">
        <header className="py-6 flex md:items-center gap-4 flex-col md:flex-row items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold text-black">
              Documents - {session?.user.username}
            </h3>
            <p className="text-sm text-zinc-700">
              Browse your documents.{" "}
              {session.user.image
                ? "Two factor authentication enabled ✅"
                : "Enable two factor authentication for better security"}
            </p>
          </div>
          <NewDocumentForm
            dialogTrigger={
              <Button variant="outlined">
                <PlusIcon className="mr-1 w-4 h-4" />
                New Document
              </Button>
            }
          />
        </header>

        {/* <TestButton /> */}

        <Suspense fallback={<div>...Loading documents</div>}>
          <DocumentGrid session={session} documents={documents || []} />
        </Suspense>
      </section>
    </main>
  );
}
