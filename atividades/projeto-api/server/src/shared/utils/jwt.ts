import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

type TokenPayload = {
  userUuid: string;
  email: string;
  role: string;
};

export function generateToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}