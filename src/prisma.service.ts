import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(private congifService: ConfigService) {
    const adapter = new PrismaBetterSqlite3({
      url: congifService.get<string>('DATABASE_URL'),
    });
    super({ adapter });
  }
}
