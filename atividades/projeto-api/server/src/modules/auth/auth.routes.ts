import { Router } from "express";
import validateReq from "../../shared/middleware/validateReq.js";
import * as a from "./auth.schema.js";
import * as authController from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", validateReq(a.userLoginSchema), authController.handleLogin)
