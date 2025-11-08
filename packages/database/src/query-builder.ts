import { SelectQueryBuilder, Brackets } from 'typeorm';

export interface FilterOptions {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between' | 'isNull' | 'isNotNull';
  value?: any;
  values?: any[];
}

export interface SortOptions {
  field: string;
  order: 'ASC' | 'DESC';
}

export class QueryBuilderHelper {
  /**
   * Apply filters to query builder
   */
  static applyFilters<T>(
    qb: SelectQueryBuilder<T>,
    filters: FilterOptions[]
  ): SelectQueryBuilder<T> {
    filters.forEach((filter, index) => {
      const paramName = `param_${index}`;
      const method = index === 0 ? 'where' : 'andWhere';

      switch (filter.operator) {
        case 'eq':
          qb[method](`${filter.field} = :${paramName}`, { [paramName]: filter.value });
          break;
        case 'ne':
          qb[method](`${filter.field} != :${paramName}`, { [paramName]: filter.value });
          break;
        case 'gt':
          qb[method](`${filter.field} > :${paramName}`, { [paramName]: filter.value });
          break;
        case 'gte':
          qb[method](`${filter.field} >= :${paramName}`, { [paramName]: filter.value });
          break;
        case 'lt':
          qb[method](`${filter.field} < :${paramName}`, { [paramName]: filter.value });
          break;
        case 'lte':
          qb[method](`${filter.field} <= :${paramName}`, { [paramName]: filter.value });
          break;
        case 'like':
          qb[method](`${filter.field} LIKE :${paramName}`, {
            [paramName]: `%${filter.value}%`,
          });
          break;
        case 'in':
          qb[method](`${filter.field} IN (:...${paramName})`, {
            [paramName]: filter.values,
          });
          break;
        case 'between':
          if (filter.values && filter.values.length === 2) {
            qb[method](`${filter.field} BETWEEN :${paramName}_start AND :${paramName}_end`, {
              [`${paramName}_start`]: filter.values[0],
              [`${paramName}_end`]: filter.values[1],
            });
          }
          break;
        case 'isNull':
          qb[method](`${filter.field} IS NULL`);
          break;
        case 'isNotNull':
          qb[method](`${filter.field} IS NOT NULL`);
          break;
      }
    });

    return qb;
  }

  /**
   * Apply sorting to query builder
   */
  static applySorting<T>(
    qb: SelectQueryBuilder<T>,
    sorts: SortOptions[]
  ): SelectQueryBuilder<T> {
    if (sorts.length === 0) return qb;

    const orderBy: Record<string, 'ASC' | 'DESC'> = {};
    sorts.forEach((sort) => {
      orderBy[sort.field] = sort.order;
    });

    return qb.orderBy(orderBy);
  }

  /**
   * Apply pagination to query builder
   */
  static applyPagination<T>(
    qb: SelectQueryBuilder<T>,
    page: number,
    limit: number
  ): SelectQueryBuilder<T> {
    const skip = (page - 1) * limit;
    return qb.skip(skip).take(limit);
  }

  /**
   * Apply search across multiple fields
   */
  static applySearch<T>(
    qb: SelectQueryBuilder<T>,
    searchTerm: string,
    fields: string[]
  ): SelectQueryBuilder<T> {
    if (!searchTerm || fields.length === 0) return qb;

    return qb.andWhere(
      new Brackets((subQb) => {
        fields.forEach((field, index) => {
          const method = index === 0 ? 'where' : 'orWhere';
          subQb[method](`${field} ILIKE :searchTerm`, {
            searchTerm: `%${searchTerm}%`,
          });
        });
      })
    );
  }

  /**
   * Apply date range filter
   */
  static applyDateRange<T>(
    qb: SelectQueryBuilder<T>,
    field: string,
    startDate?: Date,
    endDate?: Date
  ): SelectQueryBuilder<T> {
    if (startDate) {
      qb.andWhere(`${field} >= :startDate`, { startDate });
    }
    if (endDate) {
      qb.andWhere(`${field} <= :endDate`, { endDate });
    }
    return qb;
  }

  /**
   * Apply select fields
   */
  static applySelect<T>(
    qb: SelectQueryBuilder<T>,
    fields: string[],
    alias: string
  ): SelectQueryBuilder<T> {
    if (fields.length === 0) return qb;

    return qb.select(fields.map((field) => `${alias}.${field}`));
  }

  /**
   * Get paginated result with metadata
   */
  static async getPaginatedResult<T>(
    qb: SelectQueryBuilder<T>,
    page: number,
    limit: number
  ) {
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

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
   * Apply full text search (PostgreSQL specific)
   */
  static applyFullTextSearch<T>(
    qb: SelectQueryBuilder<T>,
    searchTerm: string,
    fields: string[],
    language: string = 'english'
  ): SelectQueryBuilder<T> {
    if (!searchTerm || fields.length === 0) return qb;

    const tsvectorFields = fields.join(" || ' ' || ");

    return qb.andWhere(
      `to_tsvector(:language, ${tsvectorFields}) @@ plainto_tsquery(:language, :searchTerm)`,
      { language, searchTerm }
    );
  }
}
