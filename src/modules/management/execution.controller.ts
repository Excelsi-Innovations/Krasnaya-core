import { 
  Controller, Get, Post, Body, Param, Query, 
  UsePipes, ValidationPipe, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ManagementService } from './management.service';
import { ExecuteCommandDto } from './dto/script.dto';
import { ExecutionLog } from '../../db/schema';

@Controller('management/execution')
@UsePipes(new ValidationPipe())
export class ExecutionController {
  constructor(private readonly managementService: ManagementService) {}

  @Post('execute')
  @HttpCode(HttpStatus.ACCEPTED)
  async executeCommand(@Body() executeDto: ExecuteCommandDto): Promise<ExecutionLog> {
    return this.managementService.executeCommand(executeDto);
  }

  @Get('logs')
  async getExecutionLogs(
    @Query('scriptId') scriptId?: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ): Promise<ExecutionLog[]> {
    return this.managementService.getExecutionLogs(
      scriptId ? Number(scriptId) : undefined,
      Number(limit),
      Number(offset),
    );
  }

  @Get('logs/:id')
  async getExecutionLog(@Param('id') id: string): Promise<ExecutionLog> {
    const log = await this.managementService.getExecutionLogById(Number(id));
    if (!log) {
      throw new Error(`Execution log with ID ${id} not found`);
    }
    return log;
  }

  @Get('stats')
  async getStats() {
    return this.managementService.getDashboardStats();
  }
}
