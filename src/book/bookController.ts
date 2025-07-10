import path from "node:path";
import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";
import {cloudinary, uploadOnCloudinary} from "../config/cloudinary";
import { Book } from "./bookModel";
import fs from "node:fs";
import createHttpError from "http-errors";
import { AuthRequest } from "../middleware/authenticate";

const createBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { title, genre } = req.body;
        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };
        
        const coverImageLocalPath = files?.coverImage[0]?.path
        const uploadResult = await uploadOnCloudinary(coverImageLocalPath)

        const fileLocalPath = files?.file[0]?.path
        const bookFilePathUploadResult = await uploadOnCloudinary(fileLocalPath)

        // console.log(files)
        // // 'application/pdf'
        // const coverImageMimeType = files.coverImage[0].mimetype
        //     .split("/")
        //     .at(-1);
        // const fileName = files.coverImage[0].filename;
        // const filePath = path.resolve(
        //     __dirname,
        //     "../../public/data/uploads",
        //     fileName
        // );


        // const uploadResult = await cloudinary.uploader.upload(filePath, {
        //     filename_override: fileName,
        //     folder: "book-covers",
        //     format: coverImageMimeType,
        // });

        // const bookFileName = files.file[0].filename;
        // const bookFilePath = path.resolve(
        //     __dirname,
        //     "../../public/data/uploads",
        //     bookFileName
        // );

        // const bookFilePathUploadResult = await cloudinary.uploader.upload(
        //     bookFilePath,
        //     {
        //         resource_type: "raw",
        //         filename_override: bookFileName,
        //         folder: "book-pdfs",
        //         format: "pdf",
        //     }
        // );

        // console.log("bookFileResult", bookFilePathUploadResult);
        // console.log("uploadresults", uploadResult);
        const _req = req as AuthRequest;

        const newBook = await Book.create({
            title,
            genre,
            author: _req.userId,
            coverImage: uploadResult?.secure_url,
            file: bookFilePathUploadResult?.secure_url,
        });

        // console.log(_req.userId)

        if (!newBook) {
            return next(createHttpError(500, "failed to create new book"));
        }

        // await fs.promises.unlink(filePath);
        // await fs.promises.unlink(bookFilePath);

        res.status(201).json({
            id: newBook._id,
            message: "new book created successfully",
        });
    }
);

const updateBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { title, description, genre } = req.body;
        const {bookId} = req.params;

        if (!bookId) {
            return next(createHttpError(400, "BookId is required"));
        }

        const book = await Book.findById(bookId);

        // console.log(book)

        if (!book) {
            return next(createHttpError(404, "Book not found"));
        }

        // Check access
        const _req = req as AuthRequest;
        if (book.author.toString() !== _req.userId) {
            return next(
                createHttpError(
                    403,
                    "You can not authorized to update others book."
                )
            );
        }

        // check if image field is exists.

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };

        let completeCoverImage = "";

        if (files.coverImage) {
            const filename = files.coverImage[0].filename;
            const converMimeType = files.coverImage[0].mimetype
                .split("/")
                .at(-1);

            // send files to cloudinary
            const filePath = path.resolve(
                __dirname,
                "../../public/data/uploads/" + filename
            );

            completeCoverImage = filename;

            const uploadResult = await cloudinary.uploader.upload(filePath, {
                filename_override: completeCoverImage,
                folder: "book-covers",
                format: converMimeType,
            });

            completeCoverImage = uploadResult.secure_url;
            await fs.promises.unlink(filePath);
        }

        // check if file field is exists.
        let completeFileName = "";
        if (files.file) {
            const bookFilePath = path.resolve(
                __dirname,
                "../../public/data/uploads/" + files.file[0].filename
            );

            const bookFileName = files.file[0].filename;
            completeFileName = bookFileName;

            const uploadResultPdf = await cloudinary.uploader.upload(
                bookFilePath,
                {
                    resource_type: "raw",
                    filename_override: completeFileName,
                    folder: "book-pdfs",
                    format: "pdf",
                }
            );

            completeFileName = uploadResultPdf.secure_url;
            await fs.promises.unlink(bookFilePath);
        }

        const updatedBook = await Book.findOneAndUpdate(
            {
                _id: bookId,
            },
            {
                title: title,
                description: description,
                genre: genre,
                coverImage: completeCoverImage
                    ? completeCoverImage
                    : book.coverImage,
                file: completeFileName ? completeFileName : book.file,
            },
            { new: true }
        );

        res.status(200).json({
            message: "your book is updated successfully",
            updatedBook,
        });
    }
);

const listBooks = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        // const sleep = await new Promise((resolve) => setTimeout(resolve, 5000));

        // todo: add pagination.
        const book = await Book.find().populate("author", "name");

        if (!book) {
            return next(createHttpError(400, "Error While getting book"));
        }
        res.json(book);
    }
);

const getSingleBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const bookId = req.params.bookId;

        const book = await Book.findOne({ _id: bookId })
            // populate author field
            .populate("author", "name");
        if (!book) {
            return next(createHttpError(404, "Book not found."));
        }

        return res.json(book);
    }
);

const deleteBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const bookId = req.params.bookId;

        const book = await Book.findOne({ _id: bookId });
        if (!book) {
            return next(createHttpError(404, "Book not found"));
        }

        // Check Access
        const _req = req as AuthRequest;
        if (book.author.toString() !== _req.userId) {
            return next(
                createHttpError(403, "You can not delete others book.")
            );
        }
        // book-covers/dkzujeho0txi0yrfqjsm
        // https://res.cloudinary.com/degzfrkse/image/upload/v1712590372/book-covers/u4bt9x7sv0r0cg5cuynm.png

        const coverFileSplits = book.coverImage.split("/");

        const coverImagePublicId =
            coverFileSplits.at(-2) +
            "/" +
            coverFileSplits.at(-1)?.split(".").at(-2);

        const bookFileSplits = book.file.split("/");

        const bookFilePublicId =
            bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);
        console.log("bookFilePublicId", bookFilePublicId);
        
        // todo: add try error block
        await cloudinary.uploader.destroy(coverImagePublicId);
        await cloudinary.uploader.destroy(bookFilePublicId, {
            resource_type: "raw",
        });

        await Book.deleteOne({ _id: bookId });

        return res.sendStatus(204);
    }
);

export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
