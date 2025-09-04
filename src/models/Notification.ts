import { Table, Column, ForeignKey, DataType, BelongsTo } from "sequelize-typescript";
import { BaseModel } from "@/models/BaseModel";
import { User } from "@/models/User";

/**
 * Notification type values and type definition
 */
export const NotificationType = {
  MATCH: "match",
  TEAM: "team",
  CHAT: "chat",
  GENERAL: "general",
} as const;

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

@Table({
  tableName: "notifications",
  timestamps: true,
  paranoid: true,
})
export class Notification extends BaseModel {
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column(DataType.STRING)
  declare message: string;

  @Column({
    type: DataType.ENUM(...Object.values(NotificationType)),
    defaultValue: NotificationType.GENERAL,
  })
  declare type: NotificationType;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  declare read: boolean;
}
