import { RefreshToken } from "../models/RefreshToken";
import { User } from "../models/User";
import { generateRefreshToken, generateTokenFamily, verifyRefreshToken } from "../utils/jwt";

export class RefreshTokenService {
  /**
   * Create a new refresh token for a user
   */
  static async createToken(userId: string, familyId?: string) {
    const tokenData = generateRefreshToken(userId, familyId);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const refreshToken = await RefreshToken.create({
      token: tokenData.token,
      userId,
      familyId: tokenData.familyId,
      expiresAt,
      isRevoked: false,
    });

    return {
      token: tokenData.token,
      familyId: tokenData.familyId,
      tokenId: tokenData.tokenId,
      expiresAt,
    };
  }

  /**
   * Validate a refresh token and return the associated user
   */
  static async validateToken(token: string) {
    try {
      // Verify JWT signature and expiration
      const payload = verifyRefreshToken(token);
      
      // Check if token exists in database and is valid
      const dbToken = await RefreshToken.findOne({
        where: { token },
        include: [{ model: User, as: "user" }],
      });

      if (!dbToken || !dbToken.isValid()) {
        return null;
      }

      return {
        user: dbToken.user,
        payload,
        dbToken,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Rotate refresh token (invalidate old, create new)
   */
  static async rotateToken(oldToken: string) {
    try {
      const payload = verifyRefreshToken(oldToken);
      
      // Find the old token in database
      const oldDbToken = await RefreshToken.findOne({
        where: { token: oldToken },
      });

      if (!oldDbToken || !oldDbToken.isValid()) {
        throw new Error("Invalid or expired token");
      }

      // Revoke the old token
      oldDbToken.revoke("rotated");
      await oldDbToken.save();

      // Create new token with same family ID
      const newTokenData = await this.createToken(payload.userId, payload.familyId);

      return newTokenData;
    } catch (error) {
      throw new Error("Token rotation failed");
    }
  }

  /**
   * Revoke all tokens for a user (logout from all devices)
   */
  static async revokeAllUserTokens(userId: string, reason: string = "logout") {
    const tokens = await RefreshToken.findAll({
      where: { userId, isRevoked: false },
    });

    for (const token of tokens) {
      token.revoke(reason);
      await token.save();
    }

    return tokens.length;
  }

  /**
   * Revoke a specific token
   */
  static async revokeToken(token: string, reason: string = "manual") {
    const dbToken = await RefreshToken.findOne({
      where: { token },
    });

    if (dbToken) {
      dbToken.revoke(reason);
      await dbToken.save();
      return true;
    }

    return false;
  }

  /**
   * Revoke all tokens in a family (compromise detection)
   */
  static async revokeTokenFamily(familyId: string, reason: string = "compromise") {
    const tokens = await RefreshToken.findAll({
      where: { familyId, isRevoked: false },
    });

    for (const token of tokens) {
      token.revoke(reason);
      await token.save();
    }

    return tokens.length;
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpiredTokens() {
    const expiredTokens = await RefreshToken.findAll({
      where: {
        expiresAt: {
          [require("sequelize").Op.lt]: new Date(),
        },
        isRevoked: false,
      },
    });

    for (const token of expiredTokens) {
      token.revoke("expired");
      await token.save();
    }

    return expiredTokens.length;
  }

  /**
   * Get active tokens for a user
   */
  static async getUserActiveTokens(userId: string) {
    return await RefreshToken.findAll({
      where: { userId, isRevoked: false },
      order: [["createdAt", "DESC"]],
    });
  }
}
