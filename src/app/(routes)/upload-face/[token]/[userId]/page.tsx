import { Metadata } from "next";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import { redirect } from "next/navigation";
import FaceUpload from "@/components/face-detection/FaceUpload";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "Reupload Face Image",
  description: "This will be used later for authorization",
};

export default async function Page({
  params,
}: {
  params: {
    token: string;
    userId: string;
  };
}) {
  const session = await getServerSession(authOptions);

  const { token, userId } = params;

  if (!session || session.user._id != userId) {
    redirect(`/login`);
  }

  try {
    const isValidToken = jwt.verify(
      token,
      process.env.RESET_TOKEN_SECRET as string
    );
    if (!isValidToken) {
      throw new Error("You are not authorized to update face image");
    }
  } catch (e) {
    throw new Error("You are not authorized to update face image");
  }

  return (
    <main className="min-h-[calc(100vh-75px)]">
      <section className="container-md">
        <header className="py-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold text-black">
              Reset face image - {session?.user.username}
            </h3>
            <p className="text-sm text-zinc-700">
              This will be used later for authorization purposes when accessing
              documents.
            </p>
          </div>
        </header>
        <main className="flex items-center justify-center">
          <FaceUpload />
        </main>
      </section>
    </main>
  );
}
