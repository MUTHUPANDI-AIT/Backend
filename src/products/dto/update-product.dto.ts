import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  readonly price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly stock?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly category?: string;

  // @IsOptional()
  // @IsArray()
  // @IsString({ each: true })
  // readonly tags?: string[];
}