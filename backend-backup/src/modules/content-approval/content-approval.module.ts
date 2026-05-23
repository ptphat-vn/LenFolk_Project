import { Module } from '@nestjs/common';
import { ContentApprovalController } from './content-approval.controller';
import { ContentApprovalService } from './content-approval.service';

@Module({
  controllers: [ContentApprovalController],
  providers: [ContentApprovalService]
})
export class ContentApprovalModule {}
