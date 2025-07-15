import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from "sequelize-typescript";
import { BaseModel } from "./BaseModel";
import { User } from "./User";
import { Match } from "./Match";

@Table({
  tableName: "match_participants",
  timestamps: true,
})
export class MatchParticipant extends BaseModel {
  @ForeignKey(() => User)
  @Index({ name: "unique_user_match", unique: true })
  @Column(DataType.UUID)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => Match)
  @Index({ name: "unique_user_match", unique: true })
  @Column(DataType.UUID)
  declare matchId: string;

  @BelongsTo(() => Match)
  declare match: Match;
}
