import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
  BeforeCreate,
} from "sequelize-typescript";
import { User } from "./User";
import { BaseModel } from "./BaseModel";

export enum ConnectionStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

@Table({
  tableName: "connections",
  timestamps: true,
})
export class Connection extends BaseModel {
  @ForeignKey(() => User)
  @Index({ name: "unique_connection", unique: true })
  @Column(DataType.UUID)
  declare requesterId: string;

  @BelongsTo(() => User, "requesterId")
  declare requester: User;

  @ForeignKey(() => User)
  @Index({ name: "unique_connection", unique: true })
  @Column(DataType.UUID)
  declare receiverId: string;

  @BelongsTo(() => User, "receiverId")
  declare receiver: User;

  @Column({
    type: DataType.ENUM(...Object.values(ConnectionStatus)),
    defaultValue: ConnectionStatus.PENDING,
  })
  declare status: ConnectionStatus;

  @BeforeCreate
  static validateSelfConnection(connection: Connection) {
    if (connection.requesterId === connection.receiverId) {
      throw new Error("Users cannot connect to themselves.");
    }
  }
}
