import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";

import { User } from "./User";
import { Match } from "./Match";

@Table
export class RSVP extends Model {
  @ForeignKey(() => Match)
  @Column(DataType.UUID)
  matchId!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  declare user: User;
}
