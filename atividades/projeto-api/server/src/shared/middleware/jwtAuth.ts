import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

export const jwtAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Token não informado" });
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "Token mal formatado" });
    }

    const payload = verifyToken(token);

    req.user = {
      uuid: payload.userUuid,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
};
