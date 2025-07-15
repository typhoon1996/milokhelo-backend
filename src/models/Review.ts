import {
  Table,
  Column,
  Model,
  ForeignKey,
  PrimaryKey,
  Default,
  DataType,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";
import { User } from "./User";
import { Match } from "./Match";

@Table
export class Review extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Match)
  @Column(DataType.UUID)
  matchId!: string;

  @BelongsTo(() => Match)
  match!: Match;

  @Column(DataType.INTEGER)
  rating!: number; // 1 to 5

  @Column(DataType.TEXT)
  comment!: string;

  @Column(DataType.JSONB)
  analysis?: any; // Optional AI-generated analysis

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;
}
