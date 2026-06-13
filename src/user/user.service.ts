/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prettier/prettier */

import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

  async getUserByEmail ( email: string) {
   const user = await this.prisma.user.findFirst({where:{email}})
   if(user){
    throw new ConflictException("Email already exists")
   }
    return user;
  }
}
