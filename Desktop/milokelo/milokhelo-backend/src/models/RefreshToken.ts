import {
  Table,
  Column,
  DataType,
  AllowNull,
  ForeignKey,
  Index,
  BelongsTo,
} from "sequelize-typescript";
import { BaseModel } from "./BaseModel";
import { User } from "./User";

@Table({
  tableName: "refresh_tokens",
  timestamps: true,
  indexes: [
    {
      fields: ["token"],
      unique: true,
    },
    {
      fields: ["userId"],
    },
    {
      fields: ["familyId"],
    },
  ],
})
export class RefreshToken extends BaseModel {
  @AllowNull(false)
  @Column(DataType.TEXT)
  declare token: string;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  @AllowNull(false)
  @Column(DataType.UUID)
  declare familyId: string; // For token rotation - all tokens in a session share the same family

  @AllowNull(false)
  @Column(DataType.DATE)
  declare expiresAt: Date;

  @AllowNull(false)
  @Column({ defaultValue: false, type: DataType.BOOLEAN })
  declare isRevoked: boolean;

  @Column(DataType.STRING)
  declare revokedAt?: string;

  @Column(DataType.STRING)
  declare revokedReason?: string; // e.g., "logout", "compromise", "expired"

  @BelongsTo(() => User)
  declare user: User;

  /**
   * Check if token is expired
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Check if token is valid (not expired and not revoked)
   */
  isValid(): boolean {
    return !this.isExpired() && !this.isRevoked;
  }

  /**
   * Revoke token
   */
  revoke(reason: string = "manual") {
    this.isRevoked = true;
    this.revokedAt = new Date().toISOString();
    this.revokedReason = reason;
  }
}
