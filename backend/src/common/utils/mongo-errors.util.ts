import { mongo } from "mongoose";
import { MONGO_DUPLICATE_KEY_CODE } from "../constants/app.constants.js";

export function isDuplicateKeyError(error: unknown): boolean {
	return error instanceof mongo.MongoServerError && error.code === MONGO_DUPLICATE_KEY_CODE;
}
