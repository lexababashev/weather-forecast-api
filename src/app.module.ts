import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { WeatherModule } from './weather/weather.module';
import { SubscriptionModule } from './subscription/subscription.module';


@Module({
  imports: [PrismaModule, WeatherModule, SubscriptionModule],
})
export class AppModule {}
