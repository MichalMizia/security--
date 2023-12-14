import authOptions from "@/lib/auth";
import { getRandomPin } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // verify the session
  const session = await getServerSession(authOptions);

  if (!session?.user?._id) {
    return NextResponse.json(
      { message: "Login to access the document pin" },
      { status: 403 }
    );
  }

  if (session.user.image && !session.user.isFaceAuthorized) {
    // Two factor auth enabled and face unauthorized
    return NextResponse.json(
      {
        faceError: true,
        message:
          "You have enabled two factor authentication, authorize your face to access this document.",
      },
      { status: 403 }
    );
  }

  try {
    return NextResponse.json(
      { message: "Authorized", pin: getRandomPin("0123456789", 6) },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: "There was an error during authorization" },
      { status: 403 }
    );
  }
}
