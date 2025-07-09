import { asyncHandler } from "../utils/asyncHandler";
import { Request, Response, NextFunction } from "express";

const createBook = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const {} = req.body;
    }
);

export { createBook };
