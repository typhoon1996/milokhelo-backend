import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from "sequelize-typescript";
import { User } from "./User";
import { v4 as uuidv4 } from "uuid";

import { MatchParticipant } from "./MatchParticipant";

@Table
export class Match extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  creatorId!: string;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.STRING)
  sport!: string;

  @Column(DataType.STRING)
  location!: string;

  @Column(DataType.DATE)
  startTime!: Date;

  @Column(DataType.STRING)
  skillLevel!: string;

  @Column(DataType.INTEGER)
  maxPlayers!: number;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @Column({
    type: DataType.ENUM("invited", "joined", "left"),
    defaultValue: "joined",
  })
  declare status: "invited" | "joined" | "left";

  @HasMany(() => MatchParticipant)
  participants!: MatchParticipant[];
}
