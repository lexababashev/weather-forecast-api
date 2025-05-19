import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { WeatherModule } from './weather/weather.module';
import { SubscriptionModule } from './subscription/subscription.module';


@Module({
  imports: [ConfigModule, PrismaModule, WeatherModule, SubscriptionModule],
})
export class AppModule {}
