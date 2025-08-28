import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from "sequelize-typescript";

import { User } from "@/models/User";
import { Match } from "@/models/Match";

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
