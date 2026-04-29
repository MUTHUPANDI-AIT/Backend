// Practice Oops concept for all API's.

import { Controller, Get } from '@nestjs/common';
import { OopsService } from './oops.service';

@Controller('oops')
export class OopsController {
  constructor(private readonly oopsService: OopsService) {}

  @Get('encapsulation')
  getEncapsulation() {
    return {
      concept: 'Encapsulation',
      balance: this.oopsService.getEncapsulation(),
    };
  }

  @Get('shapes')
  getShapes() {
    return {
      concept: 'Abstraction + Inheritance + Polymorphism',
      ...this.oopsService.getShapes(),
    };
  }

  @Get('vehicles')
  getVehicles() {
    return {
      concept: 'Interface + Polymorphism',
      ...this.oopsService.getVehicles(),
    };
  }
}
