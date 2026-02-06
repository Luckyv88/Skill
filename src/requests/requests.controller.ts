/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Param, Req } from '@nestjs/common';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private service: RequestsService) {}

  @Post('send/:id')
  send(@Req() req: any, @Param('id') id: string) {
    return this.service.send(req.user.userId, id);
  }

  @Post('accept/:id')
  accept(@Param('id') id: string) {
    return this.service.respond(id, 'ACCEPTED');
  }

  @Post('reject/:id')
  reject(@Param('id') id: string) {
    return this.service.respond(id, 'REJECTED');
  }
}
