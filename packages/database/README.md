# @big-bus/database

Database utilities and helpers package for Big Bus microservices.

## Features

- **Connection Manager**: Database connection management with retry logic
- **Transaction Manager**: Transaction utilities with isolation levels and retry support
- **Base Repository**: Extended repository with common operations
- **Query Builder Helper**: Advanced query building utilities
- **Migration Runner**: Database migration utilities
- **Seeder Runner**: Database seeding utilities
- **Base Entities**: Pre-configured base entity classes
- **Entity Helper**: Entity manipulation utilities

## Installation

```bash
npm install @big-bus/database
```

## Usage

### Connection Manager

```typescript
import { ConnectionManager } from '@big-bus/database';
import { DataSource } from 'typeorm';

// Create connection
const dataSource = await ConnectionManager.createConnection({
  name: 'default',
  options: {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'mydb',
    entities: ['src/entities/**/*.entity.ts'],
  },
});

// Create connection with retry
const dataSource = await ConnectionManager.createConnectionWithRetry(
  config,
  5, // max retries
  1000 // initial delay
);

// Get existing connection
const conn = ConnectionManager.getConnection('default');

// Check connection health
const isHealthy = await ConnectionManager.checkHealth('default');

// Close connection
await ConnectionManager.closeConnection('default');
```

### Transaction Manager

```typescript
import { TransactionManager } from '@big-bus/database';

// Execute in transaction
const result = await TransactionManager.executeInTransaction(
  dataSource,
  async (manager) => {
    const user = await manager.save(User, userData);
    const profile = await manager.save(Profile, { userId: user.id });
    return { user, profile };
  }
);

// Execute with isolation level
await TransactionManager.executeWithIsolation(
  dataSource,
  async (manager) => {
    // transaction logic
  },
  'SERIALIZABLE'
);

// Execute with retry on deadlock
await TransactionManager.executeWithRetry(
  dataSource,
  async (manager) => {
    // transaction logic
  },
  3 // max retries
);
```

### Base Repository

```typescript
import { BaseRepository } from '@big-bus/database';
import { Repository } from 'typeorm';

class UserRepository extends BaseRepository<User> {
  constructor(repository: Repository<User>) {
    super(repository);
  }
}

// Find with pagination
const result = await userRepo.findWithPagination(
  { where: { isActive: true } },
  { page: 1, limit: 10 }
);

// Create and save
const user = await userRepo.createAndSave(userData);

// Update by ID
const updated = await userRepo.updateById(userId, { name: 'New Name' });

// Bulk operations
await userRepo.bulkCreate([user1, user2, user3]);
await userRepo.bulkUpdate({ isActive: false }, { deletedAt: new Date() });
```

### Query Builder Helper

```typescript
import { QueryBuilderHelper, FilterOptions, SortOptions } from '@big-bus/database';

const qb = repository.createQueryBuilder('user');

// Apply filters
const filters: FilterOptions[] = [
  { field: 'user.age', operator: 'gte', value: 18 },
  { field: 'user.status', operator: 'in', values: ['active', 'pending'] },
  { field: 'user.name', operator: 'like', value: 'John' },
];
QueryBuilderHelper.applyFilters(qb, filters);

// Apply sorting
const sorts: SortOptions[] = [
  { field: 'user.createdAt', order: 'DESC' },
  { field: 'user.name', order: 'ASC' },
];
QueryBuilderHelper.applySorting(qb, sorts);

// Apply search across multiple fields
QueryBuilderHelper.applySearch(qb, 'search term', [
  'user.name',
  'user.email',
]);

// Get paginated result
const result = await QueryBuilderHelper.getPaginatedResult(qb, 1, 10);
```

### Migration Runner

```typescript
import { MigrationRunner } from '@big-bus/database';

const migrationRunner = new MigrationRunner(dataSource);

// Run pending migrations
await migrationRunner.runMigrations();

// Revert last migration
await migrationRunner.revertLastMigration();

// Show migration status
await migrationRunner.showMigrationStatus();

// Get executed migrations
const executed = await migrationRunner.getExecutedMigrations();
```

### Seeder Runner

```typescript
import { SeederRunner, BaseSeeder } from '@big-bus/database';
import { EntityManager } from 'typeorm';

// Create a seeder
class UserSeeder extends BaseSeeder {
  name = 'UserSeeder';

  async run(manager: EntityManager): Promise<void> {
    // Check if should run
    if (!(await this.shouldRun(manager, User))) {
      return;
    }

    // Create users
    await this.bulkCreate(manager, User, [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Doe', email: 'jane@example.com' },
    ]);
  }
}

// Run seeders
const seederRunner = new SeederRunner(dataSource);
seederRunner.addSeeder(new UserSeeder());
await seederRunner.runAll();

// Run in transaction
await seederRunner.runInTransaction();

// Clear tables before seeding
await seederRunner.clearTables(['users', 'profiles']);
```

### Base Entities

```typescript
import { BaseEntity, SoftDeletableEntity, VersionedEntity } from '@big-bus/database';
import { Entity, Column } from 'typeorm';

// Simple base entity with id, createdAt, updatedAt
@Entity()
class User extends BaseEntity {
  @Column()
  name: string;
}

// Entity with soft delete support
@Entity()
class Product extends SoftDeletableEntity {
  @Column()
  title: string;
}

// Entity with optimistic locking
@Entity()
class Order extends VersionedEntity {
  @Column()
  total: number;
}
```

Available base entities:
- `BaseEntity`: id (UUID), createdAt, updatedAt
- `BaseEntityWithIntId`: id (integer), createdAt, updatedAt
- `SoftDeletableEntity`: Extends BaseEntity + deletedAt
- `VersionedEntity`: Extends BaseEntity + version
- `FullBaseEntity`: Extends SoftDeletableEntity + version
- `AuditableEntity`: Extends SoftDeletableEntity + createdBy, updatedBy, deletedBy

### Entity Helper

```typescript
import { EntityHelper } from '@big-bus/database';

// Clone entity
const cloned = EntityHelper.clone(entity);

// Get changed fields
const changes = EntityHelper.getChangedFields(original, updated);

// Pick specific fields
const picked = EntityHelper.pick(entity, ['id', 'name', 'email']);

// Omit fields
const omitted = EntityHelper.omit(entity, ['password', 'secretKey']);

// Check if entity is new
const isNew = EntityHelper.isNew(entity, repository);

// Refresh entity from database
const refreshed = await EntityHelper.refresh(entity, manager, User);
```

## License

MIT
