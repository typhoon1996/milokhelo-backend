import {
  Table,
  Column,
  ForeignKey,
  DataType,
  BelongsTo,
} from "sequelize-typescript";
import { BaseModel } from "./BaseModel";
import { User } from "./User";

export enum NotificationType {
  MATCH = "match",
  TEAM = "team",
  CHAT = "chat",
  GENERAL = "general",
}

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
