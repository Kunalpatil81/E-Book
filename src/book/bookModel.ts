import mongoose, { Schema } from "mongoose";
import { User } from "../user/userModel";

export interface Book {
    _id: string;
    title: string;
    author: User;
    genre: string;
    coverImage: string;
    description: string
    file: string;
    createdAt: Date;
    updatedAt: Date;
}

const bookSchema = new Schema<Book>(
    {
        title: {
            type: String,
            required: true,
        },
        description:{
            type: String
        },
        genre: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        coverImage: {
            type: String,
            required: true,
        },
        file: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Book = mongoose.model("Book", bookSchema);
