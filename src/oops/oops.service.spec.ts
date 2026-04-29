import { OopsService } from './oops.service';

describe('OopsService', () => {
  let service: OopsService;

  beforeEach(() => {
    service = new OopsService();
  });

  it('should test encapsulation', () => {
    expect(service.getEncapsulation()).toBe(1500);
  });

  it('should test shapes', () => {
    const res = service.getShapes();
    expect(res.circleArea).toBeGreaterThan(0);
    expect(res.rectangleArea).toBe(24);
  });

  it('should test vehicles', () => {
    const res = service.getVehicles();
    expect(res.car).toBe('Car started');
    expect(res.bike).toBe('Bike started');
  });
});
