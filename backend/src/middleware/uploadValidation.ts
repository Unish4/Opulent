import type { RequestHandler } from "express";
import multer from "multer";
import { fileTypeFromBuffer } from "file-type";
import { ApiError } from "../utils/ApiError.js";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new ApiError(400, "Only JPEG, PNG or WebP images are allowed"));
      return;
    }
    cb(null, true);
  },
});

export const uploadSingleImage: RequestHandler = (req, res, next) => {
  upload.single("image")(req, res, (err: unknown) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must be 5 MB or smaller"
          : "Invalid upload";
      return next(new ApiError(400, message));
    }
    next(err);
  });
};

export const verifyImageContent: RequestHandler = async (req, _res, next) => {
  try {
    if (!req.file)
      throw new ApiError(400, "Image file is required (field name: image)");

    const detected = await fileTypeFromBuffer(req.file.buffer);
    if (
      !detected ||
      !ALLOWED_MIME.has(detected.mime) ||
      detected.mime !== req.file.mimetype
    ) {
      throw new ApiError(
        400,
        "File content does not match an allowed image type",
      );
    }
    next();
  } catch (error) {
    next(error);
  }
};
