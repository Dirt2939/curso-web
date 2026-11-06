import { Router } from "express";
import validateReq from "../../shared/middleware/validateReq.js";
import * as u from "./user.schema.js";
import * as userController from "./user.controller.js";
import { jwtAuth } from "../../shared/middleware/jwtAuth.js"

export const userRouter = Router();

userRouter.get("/", jwtAuth, userController.handleListAll);

userRouter.post("/", validateReq(u.userSchema), jwtAuth, userController.handleCreate)

userRouter.post("/bulk/create", validateReq(u.bulkUserSchema), jwtAuth, userController.handleCreateMany)

userRouter.get("/bulk/search", validateReq(u.searchUserSchema), jwtAuth, userController.handleFindMany)

userRouter.post("/me", jwtAuth, userController.handleFindMe)

userRouter.get("/:uuid", validateReq(u.userUuidSchema), jwtAuth, userController.handleFindById);

userRouter.delete("/:uuid", validateReq(u.userUuidSchema), jwtAuth, userController.handleRemove)

userRouter.put("/:uuid", validateReq(u.updateUserSchema), jwtAuth, userController.handleUpdate)
