import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Spicy Noodles' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 20000 })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ example: 'https://url.com/image.jpg' })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiPropertyOptional({ example: 'cat_2' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stock!: number;
}
