import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop([String])
  images?: string[];

  @Prop({ required: true })
  userId: string;

  // optional fields
  // @Prop([String])
  // tags?: string[];
}

export const CategorySchema = SchemaFactory.createForClass(Category);
