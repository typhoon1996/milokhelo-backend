import { Table, Column, DataType, ForeignKey, BelongsTo, Index } from "sequelize-typescript";
import { BaseModel } from "@/models/BaseModel";
import { User } from "@/models/User";
import { Team } from "@/models/Team";

export enum TeamMemberStatus {
  PENDING = "pending",
  JOINED = "joined",
}

@Table({
  tableName: "team_members",
  timestamps: true,
})
export class TeamMember extends BaseModel {
  @ForeignKey(() => Team)
  @Index({ name: "unique_team_user", unique: true })
  @Column(DataType.UUID)
  declare teamId: string;

  @BelongsTo(() => Team)
  declare team: Team;

  @ForeignKey(() => User)
  @Index({ name: "unique_team_user", unique: true })
  @Column(DataType.UUID)
  declare userId: string;

  @BelongsTo(() => User)
  declare user: User;

  @Column({
    type: DataType.ENUM(...Object.values(TeamMemberStatus)),
    defaultValue: TeamMemberStatus.PENDING,
  })
  declare status: TeamMemberStatus;
}
