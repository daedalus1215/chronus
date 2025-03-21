import { Injectable } from '@nestjs/common';

@Injectable()
export class DummyService {
  getHello(): string {
    return 'Hello World!';
  }
}
