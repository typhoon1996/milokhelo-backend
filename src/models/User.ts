import {
  Table,
  Column,
  DataType,
  AllowNull,
  Unique,
  BeforeCreate,
  BeforeUpdate,
  HasMany,
} from "sequelize-typescript";
import bcrypt from "bcrypt";
import { MatchParticipant } from "./MatchParticipant";
import { RefreshToken } from "./RefreshToken";
import { BaseModel } from "./BaseModel";

@Table({
  tableName: "users",
  timestamps: true,
})
export class User extends BaseModel {
  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string;

  @Column({ defaultValue: true, type: DataType.BOOLEAN })
  declare receiveMatchReminders: boolean;

  @Column({ defaultValue: true, type: DataType.BOOLEAN })
  declare receiveEmailNotifications: boolean;

  @HasMany(() => MatchParticipant)
  declare matchParticipants: MatchParticipant[];

  @HasMany(() => RefreshToken)
  declare refreshTokens: RefreshToken[];

  /**
   * Hash password before creation or update
   */
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed("password")) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }

  /**
   * Compare raw password with hashed password
   */
  async comparePassword(rawPassword: string): Promise<boolean> {
    return bcrypt.compare(rawPassword, this.password);
  }

  /**
   * Hide sensitive fields (like password) when serialized
   */
  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  }
}
