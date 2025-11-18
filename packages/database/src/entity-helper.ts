import { EntityManager, Repository, ObjectLiteral } from 'typeorm';

export class EntityHelper {
  /**
   * Clone an entity (without relations)
   */
  static clone<T extends ObjectLiteral>(entity: T): T {
    return { ...entity };
  }

  /**
   * Deep clone an entity (with relations)
   */
  static deepClone<T extends ObjectLiteral>(entity: T): T {
    return JSON.parse(JSON.stringify(entity));
  }

  /**
   * Compare two entities
   */
  static equals<T extends ObjectLiteral>(entity1: T, entity2: T): boolean {
    return JSON.stringify(entity1) === JSON.stringify(entity2);
  }

  /**
   * Get changed fields between two entities
   */
  static getChangedFields<T extends ObjectLiteral>(
    original: T,
    updated: T
  ): Partial<T> {
    const changes: Partial<T> = {};

    for (const key in updated) {
      if (updated[key] !== original[key]) {
        changes[key] = updated[key];
      }
    }

    return changes;
  }

  /**
   * Merge entities
   */
  static merge<T extends ObjectLiteral>(target: T, ...sources: Partial<T>[]): T {
    return Object.assign(target, ...sources);
  }

  /**
   * Pick specific fields from entity
   */
  static pick<T extends ObjectLiteral, K extends keyof T>(
    entity: T,
    keys: K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    keys.forEach((key) => {
      result[key] = entity[key];
    });
    return result;
  }

  /**
   * Omit specific fields from entity
   */
  static omit<T extends ObjectLiteral, K extends keyof T>(
    entity: T,
    keys: K[]
  ): Omit<T, K> {
    const result = { ...entity };
    keys.forEach((key) => {
      delete result[key];
    });
    return result;
  }

  /**
   * Convert entity to plain object
   */
  static toPlainObject<T extends ObjectLiteral>(entity: T): Record<string, unknown> {
    return JSON.parse(JSON.stringify(entity));
  }

  /**
   * Check if entity has specific property
   */
  static hasProperty<T extends ObjectLiteral>(
    entity: T,
    property: string
  ): boolean {
    return Object.prototype.hasOwnProperty.call(entity, property);
  }

  /**
   * Get entity metadata
   */
  static getMetadata<T extends ObjectLiteral>(repository: Repository<T>) {
    return repository.metadata;
  }

  /**
   * Get primary key value
   */
  static getPrimaryKey<T extends ObjectLiteral>(
    entity: T,
    repository: Repository<T>
  ): unknown {
    const metadata = repository.metadata;
    const primaryColumn = metadata.primaryColumns[0];
    return entity[primaryColumn.propertyName as keyof T];
  }

  /**
   * Check if entity is new (not persisted)
   */
  static isNew<T extends ObjectLiteral>(
    entity: T,
    repository: Repository<T>
  ): boolean {
    const primaryKey = this.getPrimaryKey(entity, repository);
    return !primaryKey;
  }

  /**
   * Refresh entity from database
   */
  static async refresh<T extends ObjectLiteral>(
    entity: T,
    manager: EntityManager,
    entityClass: new () => T
  ): Promise<T> {
    const repository = manager.getRepository(entityClass);
    const metadata = repository.metadata;
    const primaryColumn = metadata.primaryColumns[0];
    const id = entity[primaryColumn.propertyName as keyof T];

    const refreshed = await repository.findOne({
      where: { [primaryColumn.propertyName]: id } as unknown as import('typeorm').FindOptionsWhere<T>,
    });

    if (!refreshed) {
      throw new Error('Entity not found');
    }

    return refreshed;
  }

  /**
   * Validate entity constraints
   */
  static validateConstraints<T extends ObjectLiteral>(
    entity: T,
    repository: Repository<T>
  ): string[] {
    const errors: string[] = [];
    const metadata = repository.metadata;

    // Check required columns
    metadata.columns.forEach((column) => {
      if (!column.isNullable && !column.isGenerated) {
        const value = entity[column.propertyName as keyof T];
        if (value === null || value === undefined) {
          errors.push(`${column.propertyName} is required`);
        }
      }
    });

    return errors;
  }
}
