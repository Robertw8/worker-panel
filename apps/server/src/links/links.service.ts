import { Injectable } from '@nestjs/common';

@Injectable()
export class LinksService {
  getHealth(): { status: 'ok' } {
    return { status: 'ok' };
  }
}
