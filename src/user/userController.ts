import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { asyncHandler } from "../utils/asyncHandler";
import User from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

const createUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            const error = createHttpError(400, "All feilds are required");
            return next(error);
        }

        const existedUser = await User.findOne({ email });

        if (existedUser) {
            const error = createHttpError(409, "User with email already exist");
            return next(error);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (!user) {
            const error = createHttpError(
                500,
                "User registration failed please try again"
            );
            return next(error);
        }

        const token = sign({ id: user._id }, config.jwtSecret as string, {
            expiresIn: "7d",
        });

        return res.status(201).json({ success: "User register successfully" });
    }
);

const loginUser = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return next(createHttpError(400, "All feilds are required"));
        }

        const user = await User.findOne({ email });

        if (!user) {
            return next(createHttpError(400, "user not found"));
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return next(createHttpError(400, "password is incorrect"));
        }

        const token = sign({ id: user._id }, config.jwtSecret as string, {
            expiresIn: "7d",
        });

        // console.log('token', token)

        return res.status(200).json({ success: "user login successfully" });
    }
);

export { createUser, loginUser };
