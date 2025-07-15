import {
  CreatedAt,
  UpdatedAt,
  Column,
  Default,
  PrimaryKey,
  Model,
  DataType,
  DeletedAt,
} from "sequelize-typescript";

export abstract class BaseModel<
  T extends object = any,
  T2 extends object = any
> extends Model<T, T2> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @DeletedAt
  declare deletedAt: Date;
}
