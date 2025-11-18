import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { OAuthService } from './oauth.service';

@ApiTags('OAuth Authentication')
@Controller('auth')
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(private readonly oauthService: OAuthService) {}

  /**
   * Google OAuth
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Initiates the Google OAuth2 login flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with token' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const oauthUser = req.user as any;
      const result = await this.oauthService.validateOAuthLogin(oauthUser);

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.accessToken}&isNew=${result.isNewUser}`;

      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Google OAuth error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'OAuth authentication failed',
      });
    }
  }

  /**
   * Facebook OAuth
   */
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Initiate Facebook OAuth login' })
  async facebookAuth() {
    // Initiates the Facebook OAuth2 login flow
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with token' })
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const oauthUser = req.user as any;
      const result = await this.oauthService.validateOAuthLogin(oauthUser);

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.accessToken}&isNew=${result.isNewUser}`;

      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Facebook OAuth error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'OAuth authentication failed',
      });
    }
  }

  /**
   * Zalo OAuth
   */
  @Get('zalo')
  @UseGuards(AuthGuard('zalo'))
  @ApiOperation({ summary: 'Initiate Zalo OAuth login' })
  async zaloAuth() {
    // Initiates the Zalo OAuth2 login flow
  }

  @Get('zalo/callback')
  @UseGuards(AuthGuard('zalo'))
  @ApiOperation({ summary: 'Zalo OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with token' })
  async zaloAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const oauthUser = req.user as any;
      const result = await this.oauthService.validateOAuthLogin(oauthUser);

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${result.accessToken}&isNew=${result.isNewUser}`;

      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Zalo OAuth error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'OAuth authentication failed',
      });
    }
  }
}
