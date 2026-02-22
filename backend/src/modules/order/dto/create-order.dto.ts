import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmpty, IsEnum, IsInt, IsNotEmpty, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

class OrderItemDto {
  @ApiProperty({ example: 'prod_1' })
  @IsUUID()
  @IsNotEmpty()
  product_id!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @IsEmpty()
  price_at_time!: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  // Amounts calculated on backend
  
  @ApiProperty({ example: 'CASH', enum: ['CASH', 'CARD'] })
  @IsString()
  @IsEnum(['CASH', 'CARD'])
  payment_method!: 'CASH' | 'CARD';
}
