
interface EnvConfig {
	secret: string;
	mongoURL: string;
}

// Define constants for environment variables
export const env: EnvConfig = {
	secret: process.env.SECRET || "secret",
	mongoURL: process.env.MONGO_URL || "mongodb://127.0.0.1:27017/"
};
