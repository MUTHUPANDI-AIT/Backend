import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Role } from './role.schema'; // Import the Role schema

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  EMPLOYEE = 'employee'
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  // ✅ UPDATED: Established connection to Role schema by ID
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: false })
  role: Role | mongoose.Types.ObjectId; 
  
  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);