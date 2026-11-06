import prisma from "../../shared/database/prisma.js";
import type {
  CreateBulkUserData,
  CreateUserData,
  SearchUserData,
  UpdateUserDataBody,
} from "./user.schema.js";
import bcryp from "bcrypt";

export const listAll = async () => {
  return prisma.user.findMany();
};

export const findByUuid = async (uuid: string) => {
  return prisma.user.findUnique({
    where: {
      uuid,
    },
    omit: {
      password: true,
    },
  });
};

export const findMany = async (userSearch: SearchUserData) => {
  return prisma.user.findMany({
    where: {
      ...(userSearch.name ? { name: { contains: userSearch.name } } : {}),
      ...(userSearch.email ? { email: { contains: userSearch.email } } : {}),
      ...(userSearch.role ? { role: { equals: userSearch.role } } : {}),
    },
  });
};

const prepareUserData = async (userData: CreateUserData) => {
  const { confirmPassword, ...preparedUser } = userData;
  preparedUser.password = await bcryp.hash(preparedUser.password, 10);

  return preparedUser;
};

const prepareManyUserData = async (usersData: CreateBulkUserData) => {
  const preparedUsers = await Promise.all(
    usersData.map(async ({ confirmPassword, ...preparedUser }) => ({
      ...preparedUser,
      password: await bcryp.hash(preparedUser.password, 10),
    })),
  );

  return preparedUsers;
};

export const create = async (userData: CreateUserData) => {
  return await prisma.user.create({
    data: await prepareUserData(userData),
  });
};

export const createMany = async (usersData: CreateBulkUserData) => {
  return await prisma.user.createMany({
    data: await prepareManyUserData(usersData),
  });
};

export const remove = async (uuid: string) => {
  return prisma.user.delete({
    where: {
      uuid,
    },
  });
};

export const update = async (uuid: string, userUpdate: UpdateUserDataBody) => {
  return prisma.user.update({
    where: { uuid: uuid },
    data: {
      ...(userUpdate.name ? { name: userUpdate.name } : {}),
      ...(userUpdate.email ? { email: userUpdate.email } : {}),
      ...(userUpdate.isActive !== undefined
        ? { isActive: userUpdate.isActive }
        : {}),
      ...(userUpdate.phone ? { phone: userUpdate.phone } : {}),
      ...(userUpdate.role ? { role: userUpdate.role } : {}),
    },
  });
};
