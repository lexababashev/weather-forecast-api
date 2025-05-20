import { IsEmail, IsEnum, IsString } from 'class-validator';

export enum Frequency {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
}

export class CreateSubscriptionDto {
  @IsEmail()
  email: string;

  @IsString()
  city: string;

  @IsEnum(Frequency)
  frequency: Frequency;
}
