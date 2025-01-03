import { Body, Controller, Inject, Logger, Post } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  private readonly pendingResponses: Map<string, (value: any) => void> =
    new Map();

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  @Post('process')
  async processPayment(@Body() data: any): Promise<any> {
    const correlationId = uuidv4(); // Unique identifier for the request

    this.logger.log(`Sending notification request with ID: ${correlationId}`);
    this.kafkaClient.emit('notification.request', {
      value: {
        // Wrap payload inside `value`
        correlationId,
        data,
      },
    });

    // Return a promise that resolves when the response is received
    return new Promise((resolve, reject) => {
      // Store the resolve function for later
      this.pendingResponses.set(correlationId, resolve);

      // Set a timeout to avoid waiting forever
      setTimeout(() => {
        if (this.pendingResponses.has(correlationId)) {
          this.pendingResponses.delete(correlationId);
          reject(
            new Error('Timeout waiting for Notification service response'),
          );
        }
      }, 5000); // 5 seconds timeout
    });
  }

  @MessagePattern('notification.response')
  handleNotificationResponse(@Payload() message: any) {
    const { correlationId, ...response } = message;

    this.logger.log(`Received response for ID: ${correlationId}`);
    const resolver = this.pendingResponses.get(correlationId);
    if (resolver) {
      resolver(response); // Resolve the promise with the response
      this.pendingResponses.delete(correlationId);
    }
  }
}
