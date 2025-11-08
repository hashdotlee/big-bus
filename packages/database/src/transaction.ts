import { DataSource, EntityManager, QueryRunner } from 'typeorm';

export type TransactionCallback<T> = (manager: EntityManager) => Promise<T>;

export class TransactionManager {
  /**
   * Execute a callback within a transaction
   */
  static async executeInTransaction<T>(
    dataSource: DataSource,
    callback: TransactionCallback<T>
  ): Promise<T> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Execute multiple operations in a transaction with isolation level
   */
  static async executeWithIsolation<T>(
    dataSource: DataSource,
    callback: TransactionCallback<T>,
    isolationLevel:
      | 'READ UNCOMMITTED'
      | 'READ COMMITTED'
      | 'REPEATABLE READ'
      | 'SERIALIZABLE' = 'READ COMMITTED'
  ): Promise<T> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(isolationLevel);

    try {
      const result = await callback(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Execute operations with savepoint support
   */
  static async executeWithSavepoint<T>(
    queryRunner: QueryRunner,
    savepointName: string,
    callback: TransactionCallback<T>
  ): Promise<T> {
    await queryRunner.query(`SAVEPOINT ${savepointName}`);

    try {
      const result = await callback(queryRunner.manager);
      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      return result;
    } catch (error) {
      await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
      throw error;
    }
  }

  /**
   * Retry transaction on deadlock or serialization failure
   */
  static async executeWithRetry<T>(
    dataSource: DataSource,
    callback: TransactionCallback<T>,
    maxRetries: number = 3,
    retryDelay: number = 100
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.executeInTransaction(dataSource, callback);
      } catch (error: any) {
        lastError = error;

        // Check if error is retryable (deadlock or serialization failure)
        const isRetryable =
          error.code === '40001' || // serialization_failure
          error.code === '40P01'; // deadlock_detected

        if (!isRetryable || attempt === maxRetries - 1) {
          throw error;
        }

        // Wait before retrying with exponential backoff
        const delay = retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  /**
   * Execute operations in parallel within a transaction
   */
  static async executeParallelInTransaction<T>(
    dataSource: DataSource,
    callbacks: TransactionCallback<any>[]
  ): Promise<T[]> {
    return this.executeInTransaction(dataSource, async (manager) => {
      return Promise.all(callbacks.map((callback) => callback(manager)));
    });
  }
}
