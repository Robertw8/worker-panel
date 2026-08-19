import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
