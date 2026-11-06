import type { Response, Request } from "express";
import * as userService from "./auth.service.js";

export const handleLogin = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  const authorizedUser = await userService.login(email, password);

  if (!authorizedUser) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.status(200).json(authorizedUser)
};
