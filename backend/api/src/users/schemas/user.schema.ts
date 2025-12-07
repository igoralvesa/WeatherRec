import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, type: String })
  name: string;

  @Prop({ required: true, type: String, unique: true, index: true })
  email: string;

  @Prop({ required: true, type: String })
  password_hash: string;

  @Prop({ required: true, type: String })
  cep: string;

  @Prop({ required: true, type: String, default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

