import { KafkaOptions, Transport } from '@nestjs/microservices';

export const kafkaConfig: KafkaOptions = {
  transport: Transport.KAFKA,
  options: {
    client: {
      brokers: ['localhost:9092'], // Kafka broker address
    },
    consumer: {
      groupId: 'payment-consumer-group', // Unique consumer group for Payment service
    },
  },
};
