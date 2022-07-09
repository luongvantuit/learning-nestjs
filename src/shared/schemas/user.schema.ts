import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AuthResultModel } from '../../auth/models/auth-result.model';

@Schema({ validateBeforeSave: true })
export class User extends AuthResultModel {
  @Prop({ required: false, type: String })
  password?: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
