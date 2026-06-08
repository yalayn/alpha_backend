import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ValidateAccessUseCase } from '@application/use-cases/validate-access/validate-access.use-case';
import { ValidateAccessHttpDto } from '../dtos/validate-access.http.dto';
import { AccessResultPresenter } from '../presenters/access-result.presenter';
import { JwtAuthGuard } from '../adapters/auth/jwt-auth.guard';

@ApiTags('Orchestration')
@Controller('access')
export class AccessController {
  constructor(private readonly validateAccessUseCase: ValidateAccessUseCase) {}

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validar si un cliente tiene acceso a una funcionalidad' })
  @ApiResponse({ status: 200, description: 'Validación realizada exitosamente.' })
  async validateAccess(@Body() body: ValidateAccessHttpDto) {
    const result = await this.validateAccessUseCase.execute(body);
    return AccessResultPresenter.toResponse(result);
  }
}
