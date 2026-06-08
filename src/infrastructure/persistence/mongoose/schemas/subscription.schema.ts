import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'subscriptions', timestamps: false })
export class SubscriptionDocument extends Document {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop({ required: true })
  customerId: string;

  @Prop({ required: true })
  planId: string;

  @Prop({ required: true })
  paymentMethodId: string;

  @Prop({ required: true, enum: ['active', 'inactive', 'canceled', 'expired'] })
  status: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: false })
  endDate?: Date;

  @Prop({ required: false })
  scheduledPlanId?: string;
}

export const SubscriptionSchema = SchemaFactory.createForClass(SubscriptionDocument);
