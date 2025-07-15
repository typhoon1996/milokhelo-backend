import {
  Table,
  Column,
  ForeignKey,
  DataType,
  BelongsTo,
} from "sequelize-typescript";
import { BaseModel } from "./BaseModel";
import { Conversation } from "./Conversation";
import { User } from "./User";

@Table({
  tableName: "participants",
  timestamps: true,
})
export class Participant extends BaseModel {
  @ForeignKey(() => Conversation)
  @Column(DataType.UUID)
  declare conversationId: string;

  @BelongsTo(() => Conversation)
  declare conversation: Conversation;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  declare unreadCount: number;
}
