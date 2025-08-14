import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { User } from "./User";

@Table
export class Team extends Model {
  [x: string]: any;
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  sport!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  creatorId!: string;

  @BelongsTo(() => User)
  creator!: User;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
