/**
 * Base interface for all extensions in the Big Bus platform
 */
export interface IExtension {
  /**
   * Unique identifier for the extension
   */
  readonly id: string;

  /**
   * Human-readable name of the extension
   */
  readonly name: string;

  /**
   * Extension version following semver
   */
  readonly version: string;

  /**
   * Extension description
   */
  readonly description?: string;

  /**
   * Extension author/vendor
   */
  readonly author?: string;

  /**
   * Whether the extension is enabled
   */
  enabled: boolean;

  /**
   * Initialize the extension
   * Called when the extension is loaded
   */
  initialize(config?: any): Promise<void>;

  /**
   * Cleanup resources before unloading
   */
  destroy?(): Promise<void>;

  /**
   * Validate extension configuration
   */
  validateConfig?(config: any): Promise<boolean>;

  /**
   * Get extension metadata
   */
  getMetadata(): ExtensionMetadata;
}

/**
 * Extension metadata
 */
export interface ExtensionMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  enabled: boolean;
  category: ExtensionCategory;
  capabilities?: string[];
  dependencies?: string[];
  configSchema?: any;
}

/**
 * Extension categories
 */
export enum ExtensionCategory {
  PAYMENT = 'payment',
  AUTHENTICATION = 'authentication',
  AI = 'ai',
  AFFILIATE = 'affiliate',
  MARKETPLACE = 'marketplace',
  PERSONALIZATION = 'personalization',
  ACCOUNTING = 'accounting',
  ANALYTICS = 'analytics',
  NOTIFICATION = 'notification',
  OTHER = 'other',
}

/**
 * Base abstract class for extensions
 */
export abstract class BaseExtension implements IExtension {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly category: ExtensionCategory;

  description?: string;
  author?: string;
  enabled: boolean = true;
  protected config: any;

  async initialize(config?: any): Promise<void> {
    this.config = config;
    if (config && this.validateConfig) {
      const isValid = await this.validateConfig(config);
      if (!isValid) {
        throw new Error(`Invalid configuration for extension ${this.id}`);
      }
    }
  }

  async destroy(): Promise<void> {
    // Override in subclasses if cleanup is needed
  }

  validateConfig?(config: any): Promise<boolean>;

  getMetadata(): ExtensionMetadata {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      description: this.description,
      author: this.author,
      enabled: this.enabled,
      category: this.category,
    };
  }
}
