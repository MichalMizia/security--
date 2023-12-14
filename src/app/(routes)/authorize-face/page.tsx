// auth
import { Session, getServerSession } from "next-auth";
import authOptions from "@/lib/auth";
import FaceAuthorization from "@/components/face-detection/FaceAuth";

export default async function Home() {
  // the session is verified in the layout
  // @ts-expect-error
  const session: Session = await getServerSession(authOptions);

  return (
    <main className="min-h-[calc(100vh-70px)]">
      <section className="container-md">
        <header className="py-6 flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-semibold text-black">
              Face Authorization - {session?.user.username}
            </h3>
            <p className="text-sm text-zinc-700">
              Press the camera button when ready to authorize your face.
            </p>
          </div>
        </header>
        <FaceAuthorization />
      </section>
    </main>
  );
}
