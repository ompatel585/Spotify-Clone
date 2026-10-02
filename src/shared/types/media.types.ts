export const UploadKind = {
	Audio: "audio",
	Image: "image",
} as const;

export type UploadKind = (typeof UploadKind)[keyof typeof UploadKind];

export interface UploadSignatureRequest {
	kind: UploadKind;
}

/** Everything the browser needs to upload straight to Cloudinary. */
export interface UploadSignature {
	uploadUrl: string;
	apiKey: string;
	timestamp: number;
	signature: string;
	folder: string;
}

export interface UploadedAsset {
	url: string;
	publicId: string;
	/** Seconds, audio only */
	duration?: number;
}
