import { Repository, FindOptionsWhere, FindManyOptions, DeepPartial, ObjectLiteral } from 'typeorm';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class BaseRepository<T extends ObjectLiteral> {
  constructor(protected repository: Repository<T>) {}

  /**
   * Find all entities with pagination
   */
  async findWithPagination(
    options?: FindManyOptions<T>,
    paginationOptions: PaginationOptions = { page: 1, limit: 10 }
  ): Promise<PaginationResult<T>> {
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      ...options,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Find one entity or throw error
   */
  async findOneOrFail(where: FindOptionsWhere<T>): Promise<T> {
    const entity = await this.repository.findOne({ where });
    if (!entity) {
      throw new Error('Entity not found');
    }
    return entity;
  }

  /**
   * Create and save entity
   */
  async createAndSave(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  /**
   * Update entity by ID
   */
  async updateById(id: string | number, data: DeepPartial<T>): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.repository.update(id as unknown as FindOptionsWhere<T>, data as any);
    return this.findOneOrFail({ id } as unknown as FindOptionsWhere<T>);
  }

  /**
   * Soft delete entity by ID
   */
  async softDeleteById(id: string | number): Promise<void> {
    await this.repository.softDelete(id as unknown as FindOptionsWhere<T>);
  }

  /**
   * Hard delete entity by ID
   */
  async deleteById(id: string | number): Promise<void> {
    await this.repository.delete(id as unknown as FindOptionsWhere<T>);
  }

  /**
   * Restore soft-deleted entity
   */
  async restoreById(id: string | number): Promise<void> {
    await this.repository.restore(id as unknown as FindOptionsWhere<T>);
  }

  /**
   * Check if entity exists
   */
  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({ where });
    return count > 0;
  }

  /**
   * Count entities
   */
  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where });
  }

  /**
   * Bulk create entities
   */
  async bulkCreate(data: DeepPartial<T>[]): Promise<T[]> {
    const entities = this.repository.create(data);
    return this.repository.save(entities);
  }

  /**
   * Bulk update entities
   */
  async bulkUpdate(criteria: FindOptionsWhere<T>, data: DeepPartial<T>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.repository.update(criteria, data as any);
  }

  /**
   * Bulk delete entities
   */
  async bulkDelete(criteria: FindOptionsWhere<T>): Promise<void> {
    await this.repository.delete(criteria);
  }

  /**
   * Find entities with relations
   */
  async findWithRelations(relations: string[], where?: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.find({
      where,
      relations,
    });
  }

  /**
   * Find one entity with relations
   */
  async findOneWithRelations(
    relations: string[],
    where: FindOptionsWhere<T>
  ): Promise<T | null> {
    return this.repository.findOne({
      where,
      relations,
    });
  }
}
