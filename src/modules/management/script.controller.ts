import { 
  Controller, Get, Post, Put, Delete, Body, Param, Query, 
  UsePipes, ValidationPipe, HttpCode, HttpStatus 
} from '@nestjs/common';
import { ManagementService } from './management.service';
import { CreateScriptDto, UpdateScriptDto } from './dto/script.dto';
import { Script } from '../../db/schema';

@Controller('management/scripts')
@UsePipes(new ValidationPipe())
export class ScriptController {
  constructor(private readonly managementService: ManagementService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateScriptDto): Promise<Script> {
    return this.managementService.createScript(createDto);
  }

  @Get()
  async findAll(): Promise<Script[]> {
    return this.managementService.findAllScripts();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Script> {
    const script = await this.managementService.findScriptById(Number(id));
    if (!script) {
      throw new Error(`Script with ID ${id} not found`);
    }
    return script;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateScriptDto): Promise<Script> {
    return this.managementService.updateScript(Number(id), updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.managementService.deleteScript(Number(id));
  }
}
