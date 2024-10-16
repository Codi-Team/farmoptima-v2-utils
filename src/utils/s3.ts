import {
  PutObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { BadRequestError, InternalServerError } from "./error";
import { logger } from "./logger";

interface S3Config {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;
  region: string;
  bucket: string;
}

export class useS3 {
  private client: S3Client;

  constructor(private config: S3Config) {
    const { accessKeyId, secretAccessKey, endpoint, region } = config;
    this.client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: false,
    });
  }

  async uploadObject({
    key,
    body,
    metadata = {},
    contentType,
    acl = "public-read",
  }: {
    key: string;
    body: string | Buffer;
    metadata?: { [key: string]: string };
    contentType?: string;
    acl?:
      | "private"
      | "public-read"
      | "public-read-write"
      | "authenticated-read"
      | "aws-exec-read"
      | "bucket-owner-read"
      | "bucket-owner-full-control";
  }): Promise<string> {
    // Convert body to a Buffer if it's a string
    let bodyStream: Buffer | string = body;

    if (typeof body === "string") {
      bodyStream = Buffer.from(body);
    }

    try {
      // Send the command to upload the object to S3
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.config.bucket,
          Key: key,
          Body: bodyStream,
          ACL: acl,
          Metadata: metadata,
          ContentType: contentType,
          ContentLength: Buffer.byteLength(bodyStream),
        })
      );
      return "Successfully uploaded file.";
    } catch (error) {
      console.error("Error uploading object:", error);
      throw new InternalServerError("Upload failed.");
    }
  }

  async deleteObject(key: string): Promise<string> {
    // Ensure a valid key is provided before attempting deletion
    if (!key) {
      throw new BadRequestError("Key is required to delete an object.");
    }
    try {
      // Send the command to delete the object from S3
      await this.client.send(
        new DeleteObjectCommand({
          Key: key,
          Bucket: this.config.bucket,
        })
      );
      return "Successfully deleted file.";
    } catch (error) {
      logger.error("Error deleting object:", error);
      throw new InternalServerError("Delete failed.");
    }
  }
}
