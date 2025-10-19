import { NextFunction, Request, Response } from "express";
import { isStrongPassword, isEmailValid } from "@/config/validator";

export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!isEmailValid(email)) {
        return res.status(400).json({ ok: false, error: 'invalid_email' });
    }

    next()
}

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body;

    if (!isEmailValid(email)) {
        return res.status(400).json({ ok: false, error: 'invalid_email' });
    }

    if (!isStrongPassword(password)) {
        return res.status(400).json({ ok: false, error: 'invalid_password' });
    }

    next()
}