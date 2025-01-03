import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BiDirectionalController } from './bi-directional/bi-directional.controller';
import { BiDirectionalAlternativeController } from './bi-directional-alternative/bi-directional-alternative.controller';
import { UniDirectionalController } from './uni-directional/uni-directional.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9092'],
          },
          consumer: {
            groupId: 'payment-service-group',
          },
          producer: {
            idempotent: true,
          },
        },
      },
    ]),
  ],
  controllers: [
    AppController,
    BiDirectionalController,
    BiDirectionalAlternativeController,
    UniDirectionalController,
  ],
  providers: [AppService],
})
export class AppModule {}
