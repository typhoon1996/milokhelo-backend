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
import { User } from "@/models/User";
import { Match } from "@/models/Match";

@Table
export class Review extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  declare id: string;

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

  /**
   * AI-generated analysis of the review
   */
  @Column(DataType.JSONB)
  analysis?: {
    sentiment?: "positive" | "negative" | "neutral";
    keywords?: string[];
    summary?: string;
    // Add more specific fields as needed based on your analysis requirements
  };

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}
