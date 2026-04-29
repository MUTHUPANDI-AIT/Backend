// Practice Oops concept for all API's.

import { Test, TestingModule } from '@nestjs/testing';
import { OopsController } from './oops.controller';
import { OopsService } from './oops.service';

describe('OopsController', () => {
  let controller: OopsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OopsController],
      providers: [OopsService],
    }).compile();

    controller = module.get<OopsController>(OopsController);
  });

  it('should return encapsulation result', () => {
    const res = controller.getEncapsulation();
    expect(res.balance).toBe(1500);
  });

  it('should return shapes result', () => {
    const res = controller.getShapes();
    expect(res.rectangleArea).toBe(24);
  });

  it('should return vehicles result', () => {
    const res = controller.getVehicles();
    expect(res.car).toBe('Car started');
    expect(res.bike).toBe('Bike started');
  });
});