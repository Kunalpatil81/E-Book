import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import Jwt from "jsonwebtoken";
import { config } from "../config/config";
import { asyncHandler } from "../utils/asyncHandler";

export interface AuthRequest extends Request {
    userId: string;
}

const authenticate = asyncHandler((req: Request, res: Response, next: NextFunction) => {
    const token = req.header("Authorization");
    if (!token) {
        return next(createHttpError(401, "Authorization token is required."));
    }

    const parsedToken = token.split(" ")[1];

    const decoded = Jwt.verify(parsedToken, config.jwtSecret as string);

    if(!decoded) {
        return next(createHttpError(400, "Token Expired...!"))
    }
    console.log("decoded", decoded);

    const _req = req as AuthRequest;
    _req.userId = decoded.sub as string;
    next();
}) 

export default authenticate
