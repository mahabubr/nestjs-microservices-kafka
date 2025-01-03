import { Controller, Inject, OnModuleInit } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientKafka } from '@nestjs/microservices';

@Controller()
export class AppController implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  @MessagePattern('notification.request')
  async handleNotificationRequest(@Payload() message: any) {
    console.log(message);

    console.log('Emitting response to notification.response');
    this.kafkaClient.emit('notification.response', message);
  }
}
