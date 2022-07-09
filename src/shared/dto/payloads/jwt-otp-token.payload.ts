import { JwtSpecialTokenPayload } from './jwt-special-token.payload';

export interface JwtOtpTokenPayload extends JwtSpecialTokenPayload {
  uid?: string;
  phoneNumber?: string;
  countryCode?: string;
}
