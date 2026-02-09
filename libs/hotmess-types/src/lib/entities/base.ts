/**
 * Base entity with common fields.
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Soft-deletable entity.
 */
export interface SoftDeletable {
  deletedAt?: Date;
}
