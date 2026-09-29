import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingSku = await this.productRepository.findOne({
      where: { sku: createProductDto.sku },
    });
    if (existingSku) {
      throw new BadRequestException(
        `Ya existe un producto con el SKU: ${createProductDto.sku}`,
      );
    }

    const existingName = await this.productRepository.findOne({
      where: { name: createProductDto.name },
    });
    if (existingName) {
      throw new BadRequestException(
        `Ya existe un producto registrado con el nombre: ${createProductDto.name}`,
      );
    }

    try {
      const newProduct = this.productRepository.create(createProductDto);
      return await this.productRepository.save(newProduct);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(
        `El producto con el ID "${id}" no fue encontrado`,
      );
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingSku = await this.productRepository.findOne({
        where: { sku: updateProductDto.sku },
      });
      if (existingSku) {
        throw new BadRequestException(
          `Ya existe otro producto registrado con el SKU: ${updateProductDto.sku}`,
        );
      }
    }

    if (updateProductDto.name && updateProductDto.name !== product.name) {
      const existingName = await this.productRepository.findOne({
        where: { name: updateProductDto.name },
      });
      if (existingName) {
        throw new BadRequestException(
          `Ya existe otro producto registrado con el nombre: ${updateProductDto.name}`,
        );
      }
    }

    try {
      const updatedProduct = this.productRepository.merge(
        product,
        updateProductDto,
      );
      return await this.productRepository.save(updatedProduct);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string): Promise<{ message: string; id: string }> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return {
      message: `El producto con ID "${id}" ha sido eliminado exitosamente.`,
      id,
    };
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail || 'Llave duplicada en la base de datos');
    }
    throw new InternalServerErrorException(
      'Ocurrió un error inesperado al procesar la solicitud en la base de datos.',
    );
  }
}
