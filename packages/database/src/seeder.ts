import { DataSource, DeepPartial, EntityManager } from 'typeorm';

export interface SeederInterface {
  name: string;
  run(manager: EntityManager): Promise<void>;
}

export class SeederRunner {
  private seeders: SeederInterface[] = [];

  constructor(private dataSource: DataSource) {}

  /**
   * Register a seeder
   */
  addSeeder(seeder: SeederInterface): this {
    this.seeders.push(seeder);
    return this;
  }

  /**
   * Register multiple seeders
   */
  addSeeders(seeders: SeederInterface[]): this {
    this.seeders.push(...seeders);
    return this;
  }

  /**
   * Run all registered seeders
   */
  async runAll(): Promise<void> {
    console.log(`Running ${this.seeders.length} seeder(s)...`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      for (const seeder of this.seeders) {
        console.log(`Running seeder: ${seeder.name}`);
        await seeder.run(queryRunner.manager);
        console.log(`✓ ${seeder.name} completed`);
      }
      console.log('All seeders completed successfully');
    } catch (error) {
      console.error('Error running seeders:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Run a specific seeder by name
   */
  async runSeeder(name: string): Promise<void> {
    const seeder = this.seeders.find((s) => s.name === name);

    if (!seeder) {
      throw new Error(`Seeder '${name}' not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      console.log(`Running seeder: ${seeder.name}`);
      await seeder.run(queryRunner.manager);
      console.log(`✓ ${seeder.name} completed`);
    } catch (error) {
      console.error(`Error running seeder '${name}':`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Run seeders in transaction
   */
  async runInTransaction(): Promise<void> {
    console.log(`Running ${this.seeders.length} seeder(s) in transaction...`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const seeder of this.seeders) {
        console.log(`Running seeder: ${seeder.name}`);
        await seeder.run(queryRunner.manager);
        console.log(`✓ ${seeder.name} completed`);
      }
      await queryRunner.commitTransaction();
      console.log('All seeders completed successfully');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error running seeders, transaction rolled back:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Clear all data from specific tables
   */
  async clearTables(tableNames: string[]): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Disable foreign key checks temporarily
      await queryRunner.query('SET session_replication_role = replica;');

      for (const tableName of tableNames) {
        console.log(`Clearing table: ${tableName}`);
        await queryRunner.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);
      }

      // Re-enable foreign key checks
      await queryRunner.query('SET session_replication_role = DEFAULT;');

      console.log('Tables cleared successfully');
    } catch (error) {
      console.error('Error clearing tables:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get list of registered seeders
   */
  getSeeders(): SeederInterface[] {
    return [...this.seeders];
  }

  /**
   * Clear registered seeders
   */
  clearSeeders(): void {
    this.seeders = [];
  }
}

/**
 * Base seeder class for convenience
 */
export abstract class BaseSeeder implements SeederInterface {
  abstract name: string;
  abstract run(manager: EntityManager): Promise<void>;

  /**
   * Helper method to create entities in bulk
   */
  protected async bulkCreate<T extends object>(
    manager: EntityManager,
    entityClass: new () => T,
    data: DeepPartial<T>[]
  ): Promise<T[]> {
    const repository = manager.getRepository(entityClass);
    const entities = repository.create(data);
    return repository.save(entities);
  }

  /**
   * Helper method to check if seeder should run
   */
  protected async shouldRun<T>(
    manager: EntityManager,
    entityClass: new () => T
  ): Promise<boolean> {
    const repository = manager.getRepository(entityClass);
    const count = await repository.count();
    return count === 0;
  }
}
