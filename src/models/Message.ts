import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  ForeignKey,
  DataType,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { Conversation } from "./Conversation";
import { User } from "./User";

@Table
export class Message extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Conversation)
  @Column(DataType.UUID)
  conversationId!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  senderId!: string;

  @Column(DataType.TEXT)
  text!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
