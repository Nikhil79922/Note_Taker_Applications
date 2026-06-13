/* eslint-disable prettier/prettier */
import { Body, Injectable } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {

   registerService(payload : RegisterDto){
    return payload

   } 
}
