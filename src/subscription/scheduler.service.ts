import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WeatherService } from '../weather/weather.service';
import { MailerService } from '@nestjs-modules/mailer';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SchedulerService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly weatherService: WeatherService,
    private readonly mailerService: MailerService,
  ) {}

  onModuleInit() {
    this.startScheduler();
  }

  startScheduler() {
    console.log('Weather update scheduler started');
  }

  @Cron('*/10 * * * * *') //       CronExpression.EVERY_HOUR
  async handleHourlyUpdates() {
    const hourlySubscriptions = await this.prisma.subscription.findMany({
      where: {
        frequency: 'HOURLY',
        confirmed: true,
      },
    });

    for (const sub of hourlySubscriptions) {
      await this.sendWeatherUpdate(sub);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM) //   '*/30 * * * * *'
  async handleDailyUpdates() {
    const dailySubscriptions = await this.prisma.subscription.findMany({
      where: {
        frequency: 'DAILY',
        confirmed: true,
      },
    });

    for (const sub of dailySubscriptions) {
      await this.sendWeatherUpdate(sub);
    }
  }

  private async sendWeatherUpdate(subscription: {
    email: string;
    city: string;
    token: string;
  }) {
    try {
      const weather = await this.weatherService.getWeather(subscription.city);
      const unsubscribeLink = `http://localhost:3000/api/subscription/unsubscribe/${subscription.token}`;

      if (process.env.NODE_ENV === 'production') {
        await this.mailerService.sendMail({
          to: subscription.email,
          subject: `Weather update for ${subscription.city}`,
          template: 'weather-update',
          context: {
            city: subscription.city,
            temperature: weather.temperature,
            humidity: weather.humidity,
            description: weather.description,
            unsubscribeLink,
          },
        });
      } else {
        await this.mockSendWeatherUpdateEmail(
          subscription.email,
          subscription.city,
          weather,
          unsubscribeLink,
        );
      }

      console.log(`Weather update sent to ${subscription.email}`);
    } catch (error) {
      console.error(
        `Failed to send update to ${subscription.email}:`,
        error.message,
      );
    }
  }

  private async mockSendWeatherUpdateEmail(
    email: string,
    city: string,
    weather: { temperature: number; humidity: number; description: string },
    unsubscribeLink: string,
  ) {
    console.log('\n========== EMAIL ==========');
    console.log(`Receiver: ${email}`);
    console.log(`Theme: Weather update for ${city}`);
    console.log('Type: Templated email (weather-update)');
    console.log('Context:');
    console.log(`- City: ${city}`);
    console.log(`- Temperature: ${weather.temperature}`);
    console.log(`- Humidity: ${weather.humidity}`);
    console.log(`- Description: ${weather.description}`);
    console.log(`- Link unsubscribe: ${unsubscribeLink}`);
    console.log('========================================\n');

    return Promise.resolve();
  }
}
