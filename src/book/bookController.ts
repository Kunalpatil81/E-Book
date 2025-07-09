import path from "node:path";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";
import { Book } from "./bookModel";
import fs from 'node:fs'
import createHttpError from "http-errors";

const createBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { title, genre } = req.body;
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };
        // 'application/pdf'
        const coverImageMimeType = files.coverImage[0].mimetype
            .split("/")
            .at(-1);
        const fileName = files.coverImage[0].filename;
        const filePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            fileName
        );

        const uploadResult = await cloudinary.uploader.upload(filePath, {
            filename_override: fileName,
            folder: "book-covers",
            format: coverImageMimeType,
        });

        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(
            __dirname,
            "../../public/data/uploads",
            bookFileName
        );

        const bookFilePathUploadResult = await cloudinary.uploader.upload(
            bookFilePath,
            {
                resource_type: "raw",
                filename_override: bookFileName,
                folder: "book-pdfs",
                format: "pdf",
            }
        );

        console.log("bookFileResult", bookFilePathUploadResult);
        console.log("uploadresults", uploadResult);

        const newBook = await Book.create({
            title,
            genre,
            author: "686cf7df8ec7796f1e6db97e",
            coverImage: uploadResult.secure_url,
            file: bookFilePathUploadResult.secure_url,
        });

        if(!newBook){
            return next(createHttpError(500, "failed to create new book"))
        }

        await fs.promises.unlink(filePath)
        await fs.promises.unlink(bookFilePath)

        res.status(201).json({id: newBook._id, message: 'new book created successfully'});
    }
);

export { createBook };
