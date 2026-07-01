import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'contact_messages', timestamps: false })
export class ContactMessageDocument extends Document {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, index: true })
  senderId: string;

  @Prop({ required: true })
  senderName: string;

  @Prop({ required: true })
  senderEmail: string;

  @Prop({ required: true, enum: ['comment', 'request'] })
  type: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, index: true })
  createdAt: Date;
}

export const ContactMessageSchema = SchemaFactory.createForClass(ContactMessageDocument);
