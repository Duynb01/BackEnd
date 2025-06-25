import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VouchersService {
  constructor(private readonly prisma: PrismaService) {
  }

  async create(userId: string, createVoucherDTO: CreateVoucherDto){
    return this.prisma.voucher.create({
      data: {
        name: createVoucherDTO.name,
        code: createVoucherDTO.code,
        discount: createVoucherDTO.discount,
        type: createVoucherDTO.type,
        expiryDate: new Date(createVoucherDTO.expiryDate),
        users: {
          connect:{
            id: userId,
          },
        },
      }
    })
  }

  findAll() {
    return this.prisma.voucher.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        discount: true,
        type: true,
        expiryDate: true
      },
      orderBy:{
        expiryDate: 'asc'
      },
      where: {
        active: true
      }
    })
  }

  async findValidByCode(code: string) {
    const voucher = await this.prisma.voucher.findFirst({
      where: {
        code,
        active: true,
        expiryDate:{
          gt: new Date()
        }
      }
    })
    if (!voucher) throw new BadRequestException('Voucher không tồn tại hoặc đã hết hạn!');
    return voucher;
  }

  async findByUser(userId: string){
    const voucherUsers = await this.prisma.voucherUser.findMany({
      where: {
        userId,
      },
      include: {
        voucher:{
          select:{
            id: true,
            name: true,
            code: true,
            discount: true,
            type: true,
            expiryDate: true,
            active: true,
          }
        }
      },
      orderBy:{
        voucher:{
          expiryDate: 'asc'
        }
      }
    })
    return voucherUsers.map((v) => v.voucher)
  }

  async claimVoucher(userId:string, voucherId: string){
    const voucher = await this.prisma.voucher.findUnique({
      where:{
        id: voucherId
      }
    })
    if (!voucher) throw new NotFoundException("Voucher không tồn tại")
    if(new Date(voucher.expiryDate) < new Date()){
      throw new BadRequestException('Voucher đã hết hạn')
    }
    const alreadyClaimed = await this.prisma.voucherUser.findFirst({
      where: {
        userId,
        voucherId
      }
    })
    if(alreadyClaimed) throw new BadRequestException("Bạn đã lưu voucher này rồi")
    return this.prisma.voucherUser.create({
      data:{
        userId,
        voucherId
      },
      include:{
        voucher:{
          select:{
            id: true,
            name: true,
            code: true,
            discount: true,
            type: true,
            expiryDate: true
          }
        }
      }
    })
  }

  async remove(id: string){
    const voucher = await this.prisma.voucher.findUnique({
      where:{
        id
      }
    })
    if (!voucher) throw new NotFoundException('Voucher không tồn tại');
    return this.prisma.voucher.update({
      where: { id },
      data: {active: false}
    });
  }

}
