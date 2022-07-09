import { Injectable } from '@nestjs/common';

@Injectable()
export class OtpService {
  /**
   * Generate Otp code
   * @param length is length of Otp code
   * @returns {string}
   */
  generateOtpCode(length: number): string {
    let otpCode = '';
    for (let index = 0; index < length; index++) {
      otpCode += String(Math.round(Math.random() * 9));
    }
    return otpCode;
  }
}
