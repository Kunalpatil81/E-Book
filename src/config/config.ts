import { config as conf } from "dotenv";

conf();

const _config = {
    port: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET,
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryApi: process.env.CLOUDINARY_API_KEY,
    cloudinarySecret: process.env.CLOUDINARY_SECRET,
};

export const config = Object.freeze(_config);
