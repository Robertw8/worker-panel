import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getStatus(): { name: 'INFERNO API'; status: 'ok' } {
    return {
      name: 'INFERNO API',
      status: 'ok',
    };
  }
}
