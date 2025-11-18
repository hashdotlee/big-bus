import { Controller, Get, Put, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdatePreferenceDto } from './dto/preference.dto';

@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get(':userId')
  async getPreferences(@Param('userId') userId: string) {
    return await this.preferencesService.getOrCreate(userId);
  }

  @Put(':userId')
  async updatePreferences(@Param('userId') userId: string, @Body() dto: UpdatePreferenceDto) {
    dto.userId = userId;
    return await this.preferencesService.update(dto);
  }

  @Post(':userId/favorite-routes/:routeId')
  async addFavoriteRoute(@Param('userId') userId: string, @Param('routeId') routeId: string) {
    return await this.preferencesService.addFavoriteRoute(userId, routeId);
  }

  @Delete(':userId/favorite-routes/:routeId')
  async removeFavoriteRoute(@Param('userId') userId: string, @Param('routeId') routeId: string) {
    return await this.preferencesService.removeFavoriteRoute(userId, routeId);
  }

  @Post(':userId/favorite-products/:productId')
  async addFavoriteProduct(@Param('userId') userId: string, @Param('productId') productId: string) {
    return await this.preferencesService.addFavoriteProduct(userId, productId);
  }

  @Delete(':userId/favorite-products/:productId')
  async removeFavoriteProduct(@Param('userId') userId: string, @Param('productId') productId: string) {
    return await this.preferencesService.removeFavoriteProduct(userId, productId);
  }

  @Put(':userId/notifications')
  async updateNotifications(@Param('userId') userId: string, @Body() body: any) {
    return await this.preferencesService.updateNotificationPreferences(userId, body);
  }

  @Put(':userId/privacy')
  async updatePrivacy(@Param('userId') userId: string, @Body() body: any) {
    return await this.preferencesService.updatePrivacySettings(userId, body);
  }
}
