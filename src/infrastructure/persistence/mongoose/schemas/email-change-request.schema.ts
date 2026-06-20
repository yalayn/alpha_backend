import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'email_change_requests', timestamps: false })
export class EmailChangeRequestDocument extends Document {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  newEmail: string;

  @Prop({ required: true, index: true })
  oldTokenHash: string;

  @Prop({ required: true, index: true })
  newTokenHash: string;

  @Prop({ required: true, enum: ['pending', 'applied', 'failed'] })
  status: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ required: false })
  oldConfirmedAt?: Date;

  @Prop({ required: false })
  newConfirmedAt?: Date;
}

export const EmailChangeRequestSchema = SchemaFactory.createForClass(EmailChangeRequestDocument);
