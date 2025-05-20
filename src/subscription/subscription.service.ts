import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SubscriptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async subscribe(dto: CreateSubscriptionDto) {
    const existing = await this.prisma.subscription.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already subscribed');
    }

    const token = this.generateRandomToken(4);
    const subscription = await this.prisma.subscription.create({
      data: {
        email: dto.email,
        city: dto.city,
        frequency: dto.frequency,
        token,
      },
    });

    await this.sendConfirmationEmail(subscription.email, token);

    return { message: 'Confirmation email sent' };
  }

  async confirm(token: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { token },
    });

    if (!subscription) {
      return { success: false, message: 'Invalid token' };
    }

    if (subscription.confirmed) {
      return { success: true, message: 'Already confirmed' };
    }

    await this.prisma.subscription.update({
      where: { token },
      data: { confirmed: true },
    });

    return { success: true, message: 'Subscription confirmed' };
  }

  async unsubscribe(token: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { token },
    });

    if (!subscription) {
      return { success: false, message: 'Invalid token' };
    }

    await this.prisma.subscription.delete({
      where: { token },
    });

    return { success: true, message: 'Unsubscribed successfully' };
  }

  private async sendConfirmationEmail(email: string, token: string) {
    if (process.env.NODE_ENV === 'production') {
      const port = process.env.PORT ?? 3000;
      const confirmationLink = `http://localhost:${port}/api/subscription/confirm/${token}`;
      const unsubscribeLink = `http://localhost:${port}/api/subscription/unsubscribe/${token}`;

      await this.mailerService.sendMail({
        to: email,
        subject: 'Confirm your weather subscription',
        template: 'confirmation',
        context: {
          confirmationLink,
          unsubscribeLink,
        },
      });
    } else {
      await this.mockSendConfirmationEmail(email, token);
    }
  }

  private async mockSendConfirmationEmail(email: string, token: string) {
    const port = process.env.PORT ?? 3000;
    const confirmationLink = `http://localhost:${port}/api/subscription/confirm/${token}`;
    const unsubscribeLink = `http://localhost:${port}/api/subscription/unsubscribe/${token}`;

    console.log('\n========== EMAIL ==========');
    console.log(`Receiver: ${email}`);
    console.log(`Theme: Confirm your weather subscription`);
    console.log('Type: Templeted email (confirmation)');
    console.log('Context:');
    console.log(`- Link accept: ${confirmationLink}`);
    console.log(`- Link unsubscribe: ${unsubscribeLink}`);
    console.log('========================================\n');

    return Promise.resolve();
  }

  private generateRandomToken(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    
    return result;
  }
}
