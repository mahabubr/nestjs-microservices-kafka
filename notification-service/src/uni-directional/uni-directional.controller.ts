import { Controller, Inject, Post, Body, OnModuleInit } from '@nestjs/common';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';

@Controller()
export class UniDirectionalController implements OnModuleInit {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafkaClient.connect();
  }

  @EventPattern('notification-uni-directional')
  async handleNotification(
    @Payload() eventData: any,
    @Ctx() context: KafkaContext,
  ) {
    const topic = context.getTopic();
    const partition = context.getPartition();
    const offset = context.getMessage().offset;

    console.log(
      `Event received from topic: ${topic}, partition: ${partition}, offset: ${offset}`,
    );

    // Process the event data (e.g., store in DB, trigger actions, etc.)
    // Business logic goes here
  }
}
