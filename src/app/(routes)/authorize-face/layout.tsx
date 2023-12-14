import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";

export default async function FaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (!session.user.image) {
    toast("Upload face image to be able to verify it");
    redirect("face-upload");
  }

  return [children];
}
