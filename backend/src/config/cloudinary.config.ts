import { registerAs } from "@nestjs/config";
import { validateEnv } from "./env.validation.js";

export const cloudinaryConfig = registerAs("cloudinary", () => {
	const env = validateEnv();
	return {
		enabled: env.CLOUDINARY_CLOUD_NAME !== undefined,
		cloudName: env.CLOUDINARY_CLOUD_NAME,
		apiKey: env.CLOUDINARY_API_KEY,
		apiSecret: env.CLOUDINARY_API_SECRET,
		folder: env.CLOUDINARY_FOLDER,
	};
});
