import { Body, Controller, Inject, Logger, Post } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';
import { v4 as uuidv4 } from 'uuid';

@Controller('bi-directional-alternative')
export class BiDirectionalAlternativeController {
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
    const correlationId = uuidv4();

    this.kafkaClient.emit('notification.request', {
      value: {
        correlationId,
        data,
      },
    });

    return new Promise((resolve, reject) => {
      this.pendingResponses.set(correlationId, resolve);

      setTimeout(() => {
        if (this.pendingResponses.has(correlationId)) {
          this.pendingResponses.delete(correlationId);
          reject(
            new Error('Timeout waiting for Notification service response'),
          );
        }
      }, 5000);
    });
  }

  @MessagePattern('notification.response')
  handleNotificationResponse(@Payload() message: any) {
    const { correlationId, ...response } = message;

    const resolver = this.pendingResponses.get(correlationId);
    if (resolver) {
      resolver(response);
      this.pendingResponses.delete(correlationId);
    }
  }
}
