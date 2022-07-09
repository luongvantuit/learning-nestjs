import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectTwilio, TwilioClient } from 'nestjs-twilio';
import { VARIABLE_ENVIRONMENT_ENUM } from './shared/enums/variable-environment.enum';

@Injectable()
export class AppService {
  constructor(
    @InjectTwilio() private readonly twilioClient: TwilioClient,
    private readonly configService: ConfigService,
  ) {}

  async sendOtpCode(phoneNumber: string, otpCode: string): Promise<void> {
    try {
      await this.twilioClient.messages.create({
        body: `Your AusVie verification code is: ${otpCode}`,
        from: this.configService.get<string>(
          VARIABLE_ENVIRONMENT_ENUM.TWILIO_PHONE_NUMBER,
        ),
        to: phoneNumber,
      });
    } catch (error: any) {
      throw new InternalServerErrorException(
        "Can't send Otp code to phone number",
      );
    }
  }
}
