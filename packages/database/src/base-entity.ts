import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
} from 'typeorm';

/**
 * Base entity with common fields
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

/**
 * Base entity with soft delete support
 */
export abstract class SoftDeletableEntity extends BaseEntity {
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;
}

/**
 * Base entity with optimistic locking
 */
export abstract class VersionedEntity extends BaseEntity {
  @VersionColumn()
  version!: number;
}

/**
 * Base entity with soft delete and optimistic locking
 */
export abstract class FullBaseEntity extends SoftDeletableEntity {
  @VersionColumn()
  version!: number;
}

/**
 * Base entity with integer ID
 */
export abstract class BaseEntityWithIntId {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

/**
 * Base entity with audit fields
 */
export abstract class AuditableEntity extends BaseEntity {
  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  createdBy?: string;

  updatedBy?: string;

  deletedBy?: string;
}
