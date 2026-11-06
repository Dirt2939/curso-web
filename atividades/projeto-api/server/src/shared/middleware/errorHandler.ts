import type { Request, Response, NextFunction } from "express";
import AppError from "../errors/AppErrors.js";
import { Prisma } from '../../generated/prisma/client.js';

const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        message: "User doesn't exists"
      });
    }
  } 

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
    });
  }

  console.error("Erro inesperado:", error);

  return res.status(500).json({
    message: "Internal server error",
    error: undefined,
  });
};

export default errorHandler;
