import { DataSource, DataSourceOptions } from 'typeorm';

export interface ConnectionConfig {
  name?: string;
  options: DataSourceOptions;
}

export class ConnectionManager {
  private static connections: Map<string, DataSource> = new Map();

  /**
   * Create and initialize a new database connection
   */
  static async createConnection(config: ConnectionConfig): Promise<DataSource> {
    const connectionName = config.name || 'default';

    // Check if connection already exists
    if (this.connections.has(connectionName)) {
      const existingConnection = this.connections.get(connectionName)!;
      if (existingConnection.isInitialized) {
        return existingConnection;
      }
      // If connection exists but not initialized, destroy it first
      await this.closeConnection(connectionName);
    }

    // Create new connection
    const dataSource = new DataSource(config.options);
    await dataSource.initialize();

    this.connections.set(connectionName, dataSource);
    console.log(`Database connection '${connectionName}' established successfully`);

    return dataSource;
  }

  /**
   * Get an existing connection
   */
  static getConnection(name: string = 'default'): DataSource {
    const connection = this.connections.get(name);
    if (!connection) {
      throw new Error(`Connection '${name}' not found`);
    }
    if (!connection.isInitialized) {
      throw new Error(`Connection '${name}' is not initialized`);
    }
    return connection;
  }

  /**
   * Check if a connection exists
   */
  static hasConnection(name: string = 'default'): boolean {
    return this.connections.has(name) && this.connections.get(name)!.isInitialized;
  }

  /**
   * Close a specific connection
   */
  static async closeConnection(name: string = 'default'): Promise<void> {
    const connection = this.connections.get(name);
    if (connection && connection.isInitialized) {
      await connection.destroy();
      console.log(`Database connection '${name}' closed`);
    }
    this.connections.delete(name);
  }

  /**
   * Close all connections
   */
  static async closeAllConnections(): Promise<void> {
    const closePromises: Promise<void>[] = [];

    for (const [name, connection] of this.connections.entries()) {
      if (connection.isInitialized) {
        closePromises.push(
          connection.destroy().then(() => {
            console.log(`Database connection '${name}' closed`);
          })
        );
      }
    }

    await Promise.all(closePromises);
    this.connections.clear();
  }

  /**
   * Get all active connections
   */
  static getAllConnections(): Map<string, DataSource> {
    return new Map(this.connections);
  }

  /**
   * Retry connection with exponential backoff
   */
  static async createConnectionWithRetry(
    config: ConnectionConfig,
    maxRetries: number = 5,
    initialDelay: number = 1000
  ): Promise<DataSource> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.createConnection(config);
      } catch (error) {
        lastError = error as Error;
        const delay = initialDelay * Math.pow(2, attempt);
        console.error(
          `Connection attempt ${attempt + 1} failed. Retrying in ${delay}ms...`,
          error
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw new Error(
      `Failed to establish database connection after ${maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Check connection health
   */
  static async checkHealth(name: string = 'default'): Promise<boolean> {
    try {
      const connection = this.getConnection(name);
      await connection.query('SELECT 1');
      return true;
    } catch (error) {
      console.error(`Health check failed for connection '${name}':`, error);
      return false;
    }
  }
}
