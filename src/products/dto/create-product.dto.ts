import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsInt,
  IsBoolean,
  IsOptional,
  MinLength,
  MaxLength,
  Min,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede exceder los 150 caracteres' })
  name: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  description?: string;

  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  @Type(() => Number)
  price: number;

  @IsInt({ message: 'El stock debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  @Type(() => Number)
  stock: number;

  @IsString({ message: 'El SKU debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El SKU es obligatorio' })
  @Matches(/^[A-Z0-9-]+$/i, {
    message: 'El SKU solo debe contener letras, números y guiones (ej. PROD-101)',
  })
  sku: string;

  @IsString({ message: 'La categoría debe ser una cadena de texto' })
  @IsOptional()
  category?: string;

  @IsBoolean({ message: 'isAvailable debe ser un valor booleano' })
  @IsOptional()
  isAvailable?: boolean;
}
