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

/**
 * Base model that all other models should extend from.
 * @template T - The type of the model attributes
 * @template T2 - The type of the model creation attributes (optional)
 */
export abstract class BaseModel<
  T extends object = { [key: string]: unknown },
  T2 extends object = T,
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
