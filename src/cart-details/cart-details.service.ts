import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDetailDto } from './dto/create-cart-detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CartDetail } from './entities/cart-detail.entity';
import { Repository } from 'typeorm';
import { ISubtotal } from './interfaces/subtotal.interface';
import { ITotalFinal } from './interfaces/total-final.interface';

@Injectable()
export class CartDetailsService {

  constructor(
    @InjectRepository(CartDetail)
    private cartDetailRepository: Repository<CartDetail>
  ) { }

  async create(createCartDetailDto: CreateCartDetailDto) {
    const cartDetailRef = this.cartDetailRepository.create({
      quantity: createCartDetailDto.quantity,
      product: { id: createCartDetailDto.idProduct },
      shoppingCart: { id: createCartDetailDto.idShoppingCart }
    })

    const cartDetail = await this.cartDetailRepository.save(cartDetailRef)

    return cartDetail

  }

  findAll() {
    return `This action returns all cartDetails`;
  }

  async findOneById({ id }: { id: string }) {
    const cartDetail = await this.cartDetailRepository.findOne({
      relations: {
        product: {
          section: true
        },
        shoppingCart: true
      },
      where: {
        id
      }
    })

    return cartDetail
  }

  async findOneByIdProductAndIdShopping({ idProduct, idShoppingCart }: { idProduct: string, idShoppingCart: string }) {
    const cartDetail = await this.cartDetailRepository.findOne({
      relations: {
        product: {
          section: true
        },
        shoppingCart: true,
      },
      where: {
        product: {
          id: idProduct
        },
        shoppingCart: {
          id: idShoppingCart,
        }
      }
    })
    return cartDetail
  }

  async findAllByIdShopping({ idShoppingCart }: { idShoppingCart: string }) {

    const cartDetail = await this.cartDetailRepository.find({
      relations: {
        product: {
          section: true
        },
        shoppingCart: true,
      },
      where: {
        shoppingCart: {
          id: idShoppingCart,
        }
      }
    })

    if (!cartDetail) {
      throw new NotFoundException(`not_found_cart_details`, `not_found_cart_details`)
    }


    return cartDetail
  }


  async getSubTotalByProduct({ idProduct, idShoppingCart }: { idShoppingCart: string, idProduct: string }) {

    const query =
      `
      SELECT
      sc.id as shoppingCartId,
      cd.id AS cartDetailId,
      cd.quantity,
      p.id AS productId,
      p.name AS product_name,
      p.price AS unit_price, (p.price * cd.quantity) AS subtotal_by_product
      FROM cart_details cd
      INNER JOIN products p ON cd.productId = p.id
      INNER JOIN shopping_cart sc ON cd.shoppingCartId = sc.id
      WHERE
      sc.id = '${idShoppingCart}'
      and p.id = '${idProduct}';
    `
    const rows = await this.cartDetailRepository.query(query) as ISubtotal[]

    const [result] = rows

    return result
  }

  async getTotalFinalByIdShoppingCart({ idShoppingCart }: { idShoppingCart: string }) {
    const query =
      `
      SELECT
          sd.id AS shoppingCartId,
          ROUND(SUM(pd.price * cd.quantity), 2) AS total
      FROM cart_details cd
          JOIN products pd ON cd.productId = pd.id
          JOIN shopping_cart sd ON cd.shoppingCartId = sd.id
      WHERE
          sd.id = '${idShoppingCart}'
      GROUP BY sd.id;
    `


    const rows = await this.cartDetailRepository.query(query) as ITotalFinal[]
    console.log(rows, 'desde cart-details service')


    const [result] = rows

    if (!result) {
      return {
        shoppingCartId: idShoppingCart,
        total: 0
      }
    }

    return result
  }

  async updateById({ id, cartDetail }: { id: string, cartDetail: CartDetail }) {
    const cartDetailUpdate = await this.cartDetailRepository.update({ id: id }, {
      ...cartDetail
    })

    console.log(cartDetailUpdate)
    return await this.findOneById({ id })
  }


  async updateQuantityById({ id, quantity }: { id: string, quantity: number }) {
    await this.cartDetailRepository.update({ id }, { quantity })

    const cartDetailNew = await this.cartDetailRepository.findOne({
      relations: {
        product: {
          section: true
        },
        shoppingCart: true
      },
      where: {
        id
      }
    })

    return cartDetailNew


  }

  async remove({ id }: { id: string }) {
    try {
      const cartDetails = await this.cartDetailRepository.delete(id)
      if (cartDetails.affected >= 1) {
        return {
          status: true,
          message: `correct removed resource`,
          id_delelte: `${id}`
        }
      }
    } catch (error) {
      throw new BadRequestException(`could not be deleted`, `could not be deleted`)
    }
  }
}
