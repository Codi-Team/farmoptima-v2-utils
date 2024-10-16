import { createTransport, SendMailOptions, Transporter } from "nodemailer";
import { InternalServerError } from "./error";
import { logger } from "./logger";

interface MailerConfig {
  email: string;
  password: string;
  host: string;
  port?: number;
  secure?: boolean;
}

export class useMailer {
  private transporter: Transporter;
  private readonly defaultSender: string = "FarmOptima";

  constructor(private config: MailerConfig) {
    this.transporter = createTransport({
      host: config.host,
      port: config.port || 587,
      secure: config.secure || false,
      auth: {
        user: config.email,
        pass: config.password,
      },
    });
  }

  async sendMail({
    to,
    subject,
    text,
    html,
    attachments,
  }: {
    to: string | string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: { filename: string; path: string }[];
  }): Promise<string> {
    const mailOptions: SendMailOptions = {
      from: `${this.defaultSender} <${this.config.email}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      text,
      html,
      attachments,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.response}`);
      return "Email sent successfully.";
    } catch (error) {
      logger.error(`Error sending email: ${error}`);
      throw new InternalServerError(`Failed to send email: ${error}`);
    }
  }

  // Method to verify transporter connection
  async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      logger.info("Mailer connection verified successfully.");
    } catch (error) {
      logger.error("Failed to verify mailer connection:", error);
      throw new InternalServerError("Unable to connect to mail server.");
    }
  }
}
