import { Controller, Get } from '@nestjs/common';
import { LinksService } from './links.service';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Get('health')
  getHealth(): { status: 'ok' } {
    return this.linksService.getHealth();
  }
}
