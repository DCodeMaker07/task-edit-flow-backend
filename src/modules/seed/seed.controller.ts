import { Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('api/v1/seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  findAll() {
    return this.seedService.runSeed();
  }

}
