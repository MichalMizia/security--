import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import {
  Body,
  Button,
  Head,
  Html,
  Link,
  Preview,
  Tailwind,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";

const Email = ({ url }: { url: string }) => {
  return (
    <Tailwind>
      <Head />
      <Html>
        <Head />
        <Body>
          <Text className="arial mb-4 text-base text-black dark:text-white">
            Change face image for 2-factor authentication using the link below
          </Text>
          <Button
            className="rounded-sm px-3 py-2 bg-[#000000] text-center text-[12px] font-semibold text-white no-underline"
            href={url}
          >
            Reupload Face Image
          </Button>
        </Body>
      </Html>
    </Tailwind>
  );
};

export async function sendReuploadFaceEmail(sendTo: string, url: string) {
  const sendFrom = process.env.NODEMAILER_EMAIL;
  const password = process.env.NODEMAILER_PW;

  if (!sendFrom || !password) {
    throw new Error("Please define Nodemailer ENV variables");
  }

  var transporter = nodemailer.createTransport({
    service: "gmail",
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: sendFrom,
      pass: password,
    },
  });

  const emailHtml = render(Email({ url: url }));

  var mailOptions: Mail.Options = {
    from: sendFrom,
    to: sendTo,
    subject: "Reupload Face Image",
    html: emailHtml,
  };

  await new Promise((resolve, reject) => {
    // send mail
    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
}
