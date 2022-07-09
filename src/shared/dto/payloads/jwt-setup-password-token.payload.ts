import { JwtSpecialTokenPayload } from './jwt-special-token.payload';

export interface JwtSetupPasswordTokenPayload extends JwtSpecialTokenPayload {
  phoneNumber?: string;
  countryCode?: string;
  uid?: string;
}
