/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Param,
  Req,
  Get,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequestsService } from './requests.service';

@Controller('requests')
@UseGuards(AuthGuard('jwt'))
export class RequestsController {
  constructor(private service: RequestsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.userId);
  }

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
  @Post('remove/:id')
  removeFriend(@Req() req: any, @Param('id') id: string) {
    // Remove friend by deleting the request
    // It will remove the request in any status (ACCEPTED or PENDING)
    return this.service.removeFriend(req.user.userId, id);
  }
}
