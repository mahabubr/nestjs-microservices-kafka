import { Controller, Inject, Post, Body, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller('uni-directional')
export class UniDirectionalController implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  @Post('process')
  async processPayment(@Body() data: any): Promise<any> {
    try {
      this.kafkaClient.emit('notification-uni-directional', { data });

      return { status: 'sending..' };
    } catch (error) {
      throw error;
    }
  }
}
