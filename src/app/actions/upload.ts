"use server";

import { auth } from "@/lib/auth";
import { isCloudinaryEnabled, signCloudinaryUpload, type CloudinarySignature } from "@/lib/cloudinary";

export async function getUploadSignature(folder: string): Promise<CloudinarySignature> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (!isCloudinaryEnabled()) throw new Error("Cloudinary is not configured");
  const safe = folder.replace(/[^a-zA-Z0-9/_-]/g, "").slice(0, 64) || "uploads";
  return signCloudinaryUpload(`sparkle/${session.user.id}/${safe}`);
}
