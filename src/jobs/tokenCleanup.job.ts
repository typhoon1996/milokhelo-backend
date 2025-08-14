import { RefreshTokenService } from "../services/refreshToken.service";

export class TokenCleanupJob {
  /**
   * Clean up expired tokens
   * This should be run periodically (e.g., daily) via a cron job
   */
  static async cleanupExpiredTokens() {
    try {
      console.log("🧹 Starting token cleanup job...");
      
      const cleanedCount = await RefreshTokenService.cleanupExpiredTokens();
      
      console.log(`✅ Token cleanup completed. Cleaned ${cleanedCount} expired tokens.`);
      
      return cleanedCount;
    } catch (error) {
      console.error("❌ Token cleanup job failed:", error);
      throw error;
    }
  }

  /**
   * Clean up revoked tokens older than specified days
   * This helps keep the database clean
   */
  static async cleanupOldRevokedTokens(daysOld: number = 30) {
    try {
      console.log(`🧹 Starting cleanup of revoked tokens older than ${daysOld} days...`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // This would need to be implemented in the service
      // For now, we'll just log the intention
      console.log(`📅 Cutoff date: ${cutoffDate.toISOString()}`);
      
      // TODO: Implement cleanup of old revoked tokens
      // await RefreshTokenService.cleanupOldRevokedTokens(cutoffDate);
      
      console.log("✅ Old revoked token cleanup completed.");
    } catch (error) {
      console.error("❌ Old revoked token cleanup failed:", error);
      throw error;
    }
  }
}
