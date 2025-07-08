import mongoose from "mongoose";
import { config } from "./config";

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${config.MONGO_URI}`
        );
        console.log(
            `MongoDB connected successfully...!, at HOST:- ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.log(`MongoDB connection failed...${error}`);
        process.exit(1);
    }
};

export default connectDB;
