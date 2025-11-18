import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TwoFactorService } from './two-factor.service';

// Note: You'll need to create a proper JWT auth guard
// For now, using a placeholder
class JwtAuthGuard {}

@ApiTags('Two-Factor Authentication')
@Controller('auth/2fa')
@ApiBearerAuth()
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate 2FA secret and QR code' })
  @ApiResponse({
    status: 200,
    description: 'Secret and QR code generated successfully',
  })
  async generate(@Request() req: any) {
    const userId = req.user.sub; // From JWT token
    const result = await this.twoFactorService.generateTwoFactorSecret(userId);

    return {
      success: true,
      data: result,
      message: 'Scan the QR code with your authenticator app',
    };
  }

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enable 2FA with verification code' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid verification code' })
  async enable(
    @Request() req: any,
    @Body() body: { code: string },
  ) {
    const userId = req.user.sub;
    await this.twoFactorService.enableTwoFactor(userId, body.code);

    return {
      success: true,
      message: '2FA has been enabled successfully',
    };
  }

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid verification code' })
  async disable(
    @Request() req: any,
    @Body() body: { code: string },
  ) {
    const userId = req.user.sub;
    await this.twoFactorService.disableTwoFactor(userId, body.code);

    return {
      success: true,
      message: '2FA has been disabled',
    };
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA code' })
  @ApiResponse({ status: 200, description: 'Code verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid code' })
  async verify(
    @Request() req: any,
    @Body() body: { code: string },
  ) {
    const userId = req.user.sub;
    const isValid = await this.twoFactorService.verifyTwoFactorCode(
      userId,
      body.code,
    );

    if (!isValid) {
      return {
        success: false,
        message: 'Invalid verification code',
      };
    }

    return {
      success: true,
      message: 'Code verified successfully',
    };
  }

  @Get('status')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Check 2FA status' })
  @ApiResponse({ status: 200, description: '2FA status retrieved' })
  async getStatus(@Request() req: any) {
    const userId = req.user.sub;
    const enabled = await this.twoFactorService.isTwoFactorEnabled(userId);

    return {
      success: true,
      data: {
        twoFactorEnabled: enabled,
      },
    };
  }

  @Post('backup-codes')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate backup codes for 2FA' })
  @ApiResponse({ status: 200, description: 'Backup codes generated' })
  async generateBackupCodes(@Request() req: any) {
    const userId = req.user.sub;
    const codes = await this.twoFactorService.generateBackupCodes(userId);

    return {
      success: true,
      data: {
        backupCodes: codes,
      },
      message: 'Save these codes in a secure place. Each code can only be used once.',
    };
  }
}
