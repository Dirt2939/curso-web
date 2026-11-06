import type { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";

export const validateReq = (schema: z.ZodTypeAny) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errosFormatados = error.issues.map((err) => {
          return {
            field: err.path.join("."), // path é uma array que indica onde foi o erro
            message: err.message, // Texto escrito no user.schema
          };
        });

        return res.status(400).json({
          status: "error",
          message: "Data validation went wrong.",
          errors: errosFormatados,
        });
      }

      return res.status(400).json({
        status: "error",
        message: "Something wen wrong",
        errors: error,
      });
    }
  };
};

export default validateReq;
