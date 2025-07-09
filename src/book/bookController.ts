import path from "node:path";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary";

const createBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
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

        console.log('bookFileResult', bookFilePathUploadResult)

        console.log("uploadresults", uploadResult);
        res.json({});
    }
);

export { createBook };
