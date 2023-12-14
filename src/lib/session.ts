import { getCsrfToken } from "next-auth/react";

export const updateSession = async (newSession: Record<string, any>) => {
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/session`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      csrfToken: await getCsrfToken(),
      data: newSession,
    }),
  });
};
