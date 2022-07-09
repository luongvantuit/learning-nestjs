import { PROVIDER_SPECIAL_TOKEN_ENUM } from '../../../shared/enums/provider-special-token.enum';

export interface JwtSpecialTokenPayload {
  oid: string;
  provider: PROVIDER_SPECIAL_TOKEN_ENUM;
  ip: string;
}
