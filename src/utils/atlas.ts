import { Db, MongoClient, MongoClientOptions } from "mongodb";
import { BadRequestError, InternalServerError } from "./error";
import { logger } from "./logger";

interface AtlasConfig {
  uri: string;
  db: string;
  options?: {
    maxPoolSize?: number;
    maxIdleTimeMS?: number;
    connectTimeoutMS?: number;
  };
}

export class AtlasClient {
  private static instance: AtlasClient | null = null;
  private client: MongoClient;
  private db: Db | null = null;
  private static config: AtlasConfig | null = null;

  private constructor() {
    if (!AtlasClient.config) {
      throw new BadRequestError(
        "Atlas configuration not set. Please initialize first."
      );
    }
    this.client = new MongoClient(
      AtlasClient.config.uri,
      AtlasClient.config.options || AtlasClient.getDefaultOptions()
    );
  }

  private static getDefaultOptions(): MongoClientOptions {
    return {
      maxPoolSize: 10,
      maxIdleTimeMS: 60000,
      connectTimeoutMS: 60000,
    };
  }

  private static validateConfig(config: AtlasConfig): void {
    if (!config.uri) {
      throw new BadRequestError("Database URI must be provided.");
    }
    if (!config.db) {
      throw new BadRequestError("Database name must be provided.");
    }
  }

  // Initialize the connection with config
  public static initialize(config: AtlasConfig): void {
    AtlasClient.validateConfig(config);
    if (!AtlasClient.instance) {
      AtlasClient.config = config;
      AtlasClient.instance = new AtlasClient();
      logger.info("AtlasClient initialized with provided configuration.");
    }
  }

  // Get the singleton instance
  public static getInstance(): AtlasClient {
    if (!AtlasClient.instance) {
      throw new BadRequestError(
        "AtlasClient is not initialized. Call initialize() first."
      );
    }
    return AtlasClient.instance;
  }

  // Connect to the database with retry logic
  public async connect(
    retries: number = 3,
    delay: number = 1000
  ): Promise<void> {
    await this.tryConnect(retries, delay);
  }

  private async tryConnect(retries: number, delay: number): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.client.connect();
        this.db = this.client.db(AtlasClient.config?.db);
        logger.info(`Successfully connected to ${AtlasClient.config?.db}`);
        return;
      } catch (error) {
        logger.error(`Connection attempt ${i + 1} failed: ${error}`);
        if (i < retries - 1) {
          logger.info(`Retrying in ${delay} ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    throw new InternalServerError(
      "All connection attempts to MongoDB Atlas failed."
    );
  }

  // Get the database instance
  public getDb(): Db {
    if (!this.db) {
      throw new InternalServerError(
        "Database not connected. Call connect() first."
      );
    }
    return this.db;
  }

  // Close the client connection and reset the instance
  public async disconnect(): Promise<void> {
    logger.info("Attempting to disconnect from MongoDB Atlas...");
    try {
      await this.client.close();
      AtlasClient.instance = null;
      logger.info("Successfully disconnected from MongoDB Atlas.");
    } catch (error) {
      logger.error(`Disconnection failed: ${error}`);
      throw new InternalServerError(`Disconnection failed: ${error}`);
    }
  }

  // Return the raw MongoClient instance
  public getClient(): MongoClient {
    return this.client;
  }
}
