import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  async subscribe(@Body() dto: CreateSubscriptionDto) {
    try {
      return await this.subscriptionService.subscribe(dto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Subscription failed');
    }
  }

  @Get('confirm/:token')
  async confirm(@Param('token') token: string) {
    return this.subscriptionService.confirm(token);
  }

  @Get('unsubscribe/:token')
  async unsubscribe(@Param('token') token: string) {
    return this.subscriptionService.unsubscribe(token);
  }
}
