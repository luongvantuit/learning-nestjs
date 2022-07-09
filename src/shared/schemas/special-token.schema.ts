import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ validateBeforeSave: true })
export class SpecialToken {
  @Prop({ required: false, type: String })
  phoneNumber?: string;

  @Prop({ required: false, type: String })
  countryCode?: string;

  @Prop({
    required: false,
    type: String,
    enum: ['reset-password', 'sign-up', 'sign-in', 'setup-password'],
  })
  provider?: 'reset-password' | 'sign-up' | 'sign-in' | 'setup-password';

  @Prop({
    required: false,
    type: String,
  })
  uid?: string;

  @Prop({
    required: false,
    type: String,
  })
  otpCode?: string;
}

export type SpecialTokenDocument = SpecialToken & Document;

export const SpecialTokenSchema = SchemaFactory.createForClass(SpecialToken);
