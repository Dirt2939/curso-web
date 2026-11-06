import prisma from "../../shared/database/prisma.js";
import bcryp from "bcrypt";
import { generateToken } from "../../shared/utils/jwt.js";

export const login = async (email: string, pass: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      uuid: true,
      password: true,
      email: true,
      role: true,
    },
  });

  if (!user) return null;

  const valid = await bcryp.compare(pass, user.password);

  if (!valid) return null;

  const token = generateToken({
    userUuid: user.uuid, 
    email: user.email,
    role: user.role,
  });

  return token;
};
