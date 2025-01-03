import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientKafka } from '@nestjs/microservices';

@Controller()
export class BiDirectionalAlternativeController implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  @MessagePattern('notification.request')
  async handleNotificationRequest(@Payload() message: any) {
    this.kafkaClient.emit('notification.response', message);
  }
}
