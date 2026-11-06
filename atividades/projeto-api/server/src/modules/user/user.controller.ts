import type { Response, Request } from "express";
import * as userService from "./user.service.js";
import type { SearchUserData, UpdateUserDataBody } from "./user.schema.js";

export const handleSearchByCriteria = async (req: Request, res: Response) => {
  const queryParams = req.query as unknown as SearchUserData;

  const users = await userService.findMany(queryParams);

  return res.status(200).json(users);
};

export const handleFindMany = async (req: Request, res: Response) => {
  const queryParams = req.query as unknown as SearchUserData;

  const users = await userService.findMany(queryParams);

  return res.status(200).json(users);
};

export const handleListAll = async (_req: Request, res: Response) => {
  const users = await userService.listAll();

  return res.status(200).json(users);
};

export const handleFindById = async (req: Request, res: Response) => {
  const uuid = req.params.uuid as string;

  const user = await userService.findByUuid(uuid);

  return res.status(200).json(user);
};

export const handleCreate = async (req: Request, res: Response) => {
  const user = await userService.create(req.body);

  return res.status(201).json(user);
};

export const handleCreateMany = async (req: Request, res: Response) => {
  const users = await userService.createMany(req.body);

  return res.status(200).json(users);
};

export const handleRemove = async (req: Request, res: Response) => {
  const uuid = req.params.uuid as string; // Zod already take care of his validation

  const user = await userService.remove(uuid);

  return res.status(200).json({
    message: "User removed",
    userRemoved: user,
  });
};

export const handleUpdate = async (req: Request, res: Response) => {
  const uuid = req.params.uuid as string;
  const data = req.body as UpdateUserDataBody;

  const user = await userService.update(uuid, data);

  return res.status(200).json(user);
};

export const handleFindMe = async (req: Request, res: Response) => {
  const user = await userService.findByUuid(req.user!.uuid);

  return res.status(200).json(user);
};
