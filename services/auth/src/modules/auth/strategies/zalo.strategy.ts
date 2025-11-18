import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

/**
 * Zalo OAuth2 Strategy
 * Zalo uses OAuth 2.0 protocol
 */
@Injectable()
export class ZaloStrategy extends PassportStrategy(Strategy, 'zalo') {
  constructor(private configService: ConfigService) {
    super({
      authorizationURL: 'https://oauth.zaloapp.com/v4/permission',
      tokenURL: 'https://oauth.zaloapp.com/v4/access_token',
      clientID: configService.get<string>('ZALO_APP_ID'),
      clientSecret: configService.get<string>('ZALO_APP_SECRET'),
      callbackURL: configService.get<string>('ZALO_CALLBACK_URL', 'http://localhost:3001/api/auth/zalo/callback'),
      scope: ['id', 'name', 'picture'],
      state: true,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: (err: any, user: any, info?: any) => void,
  ): Promise<any> {
    try {
      // Get user info from Zalo API
      const response = await axios.get('https://graph.zalo.me/v2.0/me', {
        headers: {
          'access_token': accessToken,
        },
        params: {
          fields: 'id,name,picture',
        },
      });

      const zaloUser = response.data;

      const user = {
        email: zaloUser.id + '@zalo.me', // Zalo might not provide email
        firstName: zaloUser.name,
        lastName: '',
        picture: zaloUser.picture?.data?.url,
        provider: 'zalo',
        providerId: zaloUser.id,
        accessToken,
        refreshToken,
      };

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
