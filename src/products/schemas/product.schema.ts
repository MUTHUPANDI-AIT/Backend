import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class ProductImage {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  mimetype: string;

  @Prop({ type: Buffer, required: true })
  data: Buffer;
}

export const ProductImageSchema = SchemaFactory.createForClass(ProductImage);

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ default: 0 })
  price?: number;

  @Prop({ default: 0 })
  stock?: number;

  @Prop()
  category?: string;

  @Prop({ type: [ProductImageSchema], default: [] })
  images?: ProductImage[];

  // optional fields
  // @Prop([String])
  // tags?: string[];

  @Prop({ default: true })
  isActive?: boolean;

  @Prop({ type: String, required: true })
  userId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
