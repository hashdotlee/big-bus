import { DataSource } from 'typeorm';

export interface MigrationOptions {
  transaction?: 'all' | 'none' | 'each';
  fake?: boolean;
}

export class MigrationRunner {
  constructor(private dataSource: DataSource) {}

  /**
   * Run pending migrations
   */
  async runMigrations(options?: MigrationOptions): Promise<void> {
    try {
      const migrations = await this.dataSource.runMigrations({
        transaction: options?.transaction || 'all',
        fake: options?.fake || false,
      });

      if (migrations.length === 0) {
        console.log('No pending migrations to run');
      } else {
        console.log(`Successfully ran ${migrations.length} migration(s):`);
        migrations.forEach((migration) => {
          console.log(`  - ${migration.name}`);
        });
      }
    } catch (error) {
      console.error('Error running migrations:', error);
      throw error;
    }
  }

  /**
   * Revert last migration
   */
  async revertLastMigration(options?: MigrationOptions): Promise<void> {
    try {
      await this.dataSource.undoLastMigration({
        transaction: options?.transaction || 'all',
        fake: options?.fake || false,
      });
      console.log('Successfully reverted last migration');
    } catch (error) {
      console.error('Error reverting migration:', error);
      throw error;
    }
  }

  /**
   * Show migration status
   */
  async showMigrationStatus(): Promise<void> {
    try {
      const migrations = await this.dataSource.showMigrations();
      console.log(`Pending migrations: ${migrations ? 'Yes' : 'No'}`);
    } catch (error) {
      console.error('Error checking migration status:', error);
      throw error;
    }
  }

  /**
   * Get executed migrations
   */
  async getExecutedMigrations() {
    try {
      const queryRunner = this.dataSource.createQueryRunner();
      const executedMigrations = await queryRunner.query(
        'SELECT * FROM migrations ORDER BY timestamp DESC'
      );
      await queryRunner.release();
      return executedMigrations;
    } catch (error) {
      console.error('Error fetching executed migrations:', error);
      return [];
    }
  }

  /**
   * Create migration file
   */
  static async createMigration(
    dataSource: DataSource,
    name: string,
    outputDir?: string
  ): Promise<string> {
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${name}.ts`;
    const dir = outputDir || './src/migrations';

    const migrationTemplate = `
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ${name}${timestamp} implements MigrationInterface {
  name = '${name}${timestamp}';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add migration logic here
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add revert logic here
  }
}
`;

    // In a real implementation, you would write this to a file
    console.log(`Migration template for ${fileName}:`);
    console.log(migrationTemplate);

    return fileName;
  }
}
