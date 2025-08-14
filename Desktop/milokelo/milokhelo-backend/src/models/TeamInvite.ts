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
import { Team } from "./Team";

export enum InviteStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
}

@Table({
  tableName: "team_invites",
  timestamps: true,
})
export class TeamInvite extends BaseModel {
  @ForeignKey(() => Team)
  @Index({ name: "unique_team_invite", unique: true })
  @Column(DataType.UUID)
  declare teamId: string;

  @BelongsTo(() => Team)
  declare team: Team;

  @ForeignKey(() => User)
  @Index({ name: "unique_team_invite", unique: true })
  @Column(DataType.UUID)
  declare invitedUserId: string;

  @BelongsTo(() => User, "invitedUserId")
  declare invitedUser: User;

  @Column({
    type: DataType.ENUM(...Object.values(InviteStatus)),
    defaultValue: InviteStatus.PENDING,
  })
  declare status: InviteStatus;
}
