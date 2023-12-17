import type { NextApiRequest, NextApiResponse } from "next";
import { createRouter } from "next-connect";
import multer from "multer";

export const BASE_ASSET_URL = "/public/uploads";

const upload = multer({
  storage: multer.diskStorage({
    destination: `.${BASE_ASSET_URL}`,
    filename: (req, file, cb) => cb(null, file.originalname),
  }),
});

const router = createRouter<NextApiRequest, NextApiResponse>();

// @ts-expect-error
router.post(upload.single("images"), (req, res) => {
  res.status(200).json({ data: "success" });
});

export default router.handler({
  onError: (error, req, res) => {
    res.status(501).json({
      error: `Sorry something Happened! ${(error as Error).message || "error"}`,
    });
  },
  onNoMatch: (req, res) => {
    res.status(405).json({ error: `Method '${req.method}' Not Allowed` });
  },
});

export const config = {
  api: {
    externalResolver: true,
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
