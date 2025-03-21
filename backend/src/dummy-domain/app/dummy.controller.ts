import { Controller, Get } from '@nestjs/common';
import { DummyService } from '../domain/dummy.service';

@Controller()
export class DummyController {
  constructor(private readonly appService: DummyService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
