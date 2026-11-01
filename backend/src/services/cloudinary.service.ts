import { cloudinary } from "../config/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { logger } from "../utils/logger.js";

export interface UploadedImage {
  url: string;
  publicId: string;
}

export const uploadImageBuffer = (
  buffer: Buffer,
  folder: string,
): Promise<UploadedImage> =>
  new Promise((resolve, reject) => {
    let settled = false;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ width: 2560, height: 2560, crop: "limit" }],
      },
      (error, result) => {
        if (settled) return;
        settled = true;
        if (error || !result) {
          logger.error({ err: error }, "Cloudinary upload failed");
          reject(new ApiError(503, "Image upload failed. Please try again."));
          return;
        }
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );

    stream.on("error", (streamErr) => {
      if (settled) return;
      settled = true;
      logger.error({ err: streamErr }, "Cloudinary upload stream error");
      reject(new ApiError(503, "Image upload failed. Please try again."));
    });

    stream.end(buffer);
  });

export const deleteImage = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};
