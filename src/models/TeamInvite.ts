import { Table, Column, DataType, ForeignKey, BelongsTo, Index } from "sequelize-typescript";
import { BaseModel } from "@/models/BaseModel";
import { User } from "@/models/User";
import { Team } from "@/models/Team";

const InviteStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

type InviteStatusType = (typeof InviteStatus)[keyof typeof InviteStatus];

export { InviteStatus, InviteStatusType };

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
  declare status: InviteStatusType;
}
