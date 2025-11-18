import { Injectable, Logger } from '@nestjs/common';
import { IExtension, ExtensionCategory, ExtensionMetadata } from './base-extension';

/**
 * Registry for managing extensions
 */
@Injectable()
export class ExtensionRegistry {
  private readonly logger = new Logger(ExtensionRegistry.name);
  private readonly extensions = new Map<string, IExtension>();
  private readonly extensionsByCategory = new Map<ExtensionCategory, Set<IExtension>>();

  /**
   * Register a new extension
   */
  async register(extension: IExtension): Promise<void> {
    if (this.extensions.has(extension.id)) {
      throw new Error(`Extension with id ${extension.id} is already registered`);
    }

    try {
      // Initialize the extension
      await extension.initialize();

      this.extensions.set(extension.id, extension);

      // Add to category map
      const metadata = extension.getMetadata();
      if (!this.extensionsByCategory.has(metadata.category)) {
        this.extensionsByCategory.set(metadata.category, new Set());
      }
      this.extensionsByCategory.get(metadata.category)!.add(extension);

      this.logger.log(`Extension registered: ${extension.id} (${extension.name})`);
    } catch (error) {
      this.logger.error(`Failed to register extension ${extension.id}:`, error);
      throw error;
    }
  }

  /**
   * Unregister an extension
   */
  async unregister(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }

    try {
      // Cleanup
      if (extension.destroy) {
        await extension.destroy();
      }

      // Remove from category map
      const metadata = extension.getMetadata();
      this.extensionsByCategory.get(metadata.category)?.delete(extension);

      this.extensions.delete(extensionId);
      this.logger.log(`Extension unregistered: ${extensionId}`);
    } catch (error) {
      this.logger.error(`Failed to unregister extension ${extensionId}:`, error);
      throw error;
    }
  }

  /**
   * Get extension by ID
   */
  get<T extends IExtension>(extensionId: string): T | undefined {
    return this.extensions.get(extensionId) as T;
  }

  /**
   * Get all extensions
   */
  getAll(): IExtension[] {
    return Array.from(this.extensions.values());
  }

  /**
   * Get extensions by category
   */
  getByCategory(category: ExtensionCategory): IExtension[] {
    return Array.from(this.extensionsByCategory.get(category) || []);
  }

  /**
   * Get enabled extensions
   */
  getEnabled(): IExtension[] {
    return this.getAll().filter(ext => ext.enabled);
  }

  /**
   * Get enabled extensions by category
   */
  getEnabledByCategory(category: ExtensionCategory): IExtension[] {
    return this.getByCategory(category).filter(ext => ext.enabled);
  }

  /**
   * Enable an extension
   */
  enable(extensionId: string): void {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }
    extension.enabled = true;
    this.logger.log(`Extension enabled: ${extensionId}`);
  }

  /**
   * Disable an extension
   */
  disable(extensionId: string): void {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`);
    }
    extension.enabled = false;
    this.logger.log(`Extension disabled: ${extensionId}`);
  }

  /**
   * Get all extension metadata
   */
  getAllMetadata(): ExtensionMetadata[] {
    return this.getAll().map(ext => ext.getMetadata());
  }

  /**
   * Check if extension exists
   */
  has(extensionId: string): boolean {
    return this.extensions.has(extensionId);
  }

  /**
   * Get count of registered extensions
   */
  count(): number {
    return this.extensions.size;
  }

  /**
   * Clear all extensions
   */
  async clear(): Promise<void> {
    const extensionIds = Array.from(this.extensions.keys());
    for (const id of extensionIds) {
      await this.unregister(id);
    }
    this.extensionsByCategory.clear();
    this.logger.log('All extensions cleared');
  }
}
