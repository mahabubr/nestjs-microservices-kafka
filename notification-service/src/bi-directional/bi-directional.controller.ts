import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class BiDirectionalController implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('notification');
    await this.kafkaClient.connect();
  }

  @MessagePattern('notification')
  async handleNotification(@Payload() message: any) {
    const response = {
      status: 'success microservices',
      message: message,
    };

    return response;
  }
}
