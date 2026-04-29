import { Injectable } from '@nestjs/common';

@Injectable()
export class OopsService {
  // Encapsulation
  getEncapsulation() {
    const acc = new BankAccount(1000);
    acc.deposit(500);
    return acc.getBalance();
  }

  // Abstraction + Inheritance + Polymorphism
  getShapes() {
    const circle = new Circle(5);
    const rectangle = new Rectangle(4, 6);

    return {
      circleArea: AreaCalculator.calculate(circle),
      rectangleArea: AreaCalculator.calculate(rectangle),
    };
  }

  // Interface + Polymorphism
  getVehicles() {
    const car: Vehicle = new Car();
    const bike: Vehicle = new Bike();

    return {
      car: car.start(),
      bike: bike.start(),
    };
  }
}

/* ================= OOP CLASSES ================= */

// Encapsulation
class BankAccount {
  private balance: number;

  constructor(initialBalance: number) {
    this.balance = initialBalance;
  }

  deposit(amount: number) {
    if (amount <= 0) throw new Error('Invalid amount');
    this.balance += amount;
  }

  getBalance() {
    return this.balance;
  }
}

// Abstraction
abstract class Shape {
  abstract area(): number;
}

// Inheritance
class Circle extends Shape {
  constructor(private radius: number) {
    super();
  }

  area(): number {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(
    private width: number,
    private height: number,
  ) {
    super();
  }

  area(): number {
    return this.width * this.height;
  }
}

// Polymorphism
class AreaCalculator {
  static calculate(shape: Shape): number {
    return shape.area();
  }
}

// Interface
interface Vehicle {
  start(): string;
}

class Car implements Vehicle {
  start(): string {
    return 'Car started';
  }
}

class Bike implements Vehicle {
  start(): string {
    return 'Bike started';
  }
}
