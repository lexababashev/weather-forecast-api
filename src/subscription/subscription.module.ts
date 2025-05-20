// src/subscription/subscription.module.ts
import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionController } from './subscription.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { SchedulerService } from './scheduler.service';
import { WeatherModule } from '../weather/weather.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    PrismaModule,
    WeatherModule,
    ScheduleModule.forRoot(),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      defaults: {
        from: `"Weather Service" <${process.env.SMTP_FROM_EMAIL}>`,
      },
    }),
  ],
  providers: [SubscriptionService, SchedulerService],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
