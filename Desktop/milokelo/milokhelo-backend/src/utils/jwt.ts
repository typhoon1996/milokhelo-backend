import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export interface RefreshTokenPayload {
  userId: string;
  familyId: string;
  tokenId: string;
}

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, ACCESS_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: string, familyId?: string) => {
  const tokenId = uuidv4();
  const tokenFamilyId = familyId || uuidv4();
  
  const payload: RefreshTokenPayload = {
    userId,
    familyId: tokenFamilyId,
    tokenId,
  };
  
  return {
    token: jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" }),
    familyId: tokenFamilyId,
    tokenId,
  };
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, REFRESH_SECRET) as RefreshTokenPayload;
};

export const generateTokenFamily = () => {
  return uuidv4();
};
