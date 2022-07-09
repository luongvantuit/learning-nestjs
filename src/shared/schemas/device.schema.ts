import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ validateBeforeSave: true })
export class Device {
  @Prop({ required: true, type: String })
  ip: string;

  @Prop({ required: true, type: Boolean, default: false })
  allow: boolean;

  @Prop({ required: true, type: String })
  userAgent: string;

  @Prop({ required: true, type: String })
  uid: string;
}

export type DeviceDocument = Device & Document;

export const DeviceSchema = SchemaFactory.createForClass(Device);
