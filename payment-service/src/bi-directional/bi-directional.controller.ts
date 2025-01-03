import { Controller, Inject, Post, Body, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Controller('bi-directional')
export class BiDirectionalController implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('notification');
    await this.kafkaClient.connect();
  }

  @Post('process')
  async processPayment(@Body() data: any): Promise<any> {
    try {
      const response = await this.kafkaClient
        .send('notification', { data })
        .toPromise();

      return response;
    } catch (error) {
      throw error;
    }
  }
}
