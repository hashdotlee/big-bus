import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPreference, PreferenceCategory } from '../../database/entities/user-preference.entity';
import { UpdatePreferenceDto } from './dto/preference.dto';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(UserPreference)
    private readonly preferenceRepository: Repository<UserPreference>,
  ) {}

  async getOrCreate(userId: string): Promise<UserPreference> {
    let preferences = await this.preferenceRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = this.preferenceRepository.create({
        userId,
        category: PreferenceCategory.ROUTE,
      });
      preferences = await this.preferenceRepository.save(preferences);
    }

    return preferences;
  }

  async update(updateDto: UpdatePreferenceDto): Promise<UserPreference> {
    const preferences = await this.getOrCreate(updateDto.userId);

    Object.assign(preferences, updateDto);

    return await this.preferenceRepository.save(preferences);
  }

  async addFavoriteRoute(userId: string, routeId: string): Promise<UserPreference> {
    const preferences = await this.getOrCreate(userId);

    if (!preferences.favoriteRoutes.includes(routeId)) {
      preferences.favoriteRoutes.push(routeId);
      return await this.preferenceRepository.save(preferences);
    }

    return preferences;
  }

  async removeFavoriteRoute(userId: string, routeId: string): Promise<UserPreference> {
    const preferences = await this.getOrCreate(userId);

    preferences.favoriteRoutes = preferences.favoriteRoutes.filter(id => id !== routeId);

    return await this.preferenceRepository.save(preferences);
  }

  async addFavoriteProduct(userId: string, productId: string): Promise<UserPreference> {
    const preferences = await this.getOrCreate(userId);

    if (!preferences.favoriteProducts.includes(productId)) {
      preferences.favoriteProducts.push(productId);
      return await this.preferenceRepository.save(preferences);
    }

    return preferences;
  }

  async removeFavoriteProduct(userId: string, productId: string): Promise<UserPreference> {
    const preferences = await this.getOrCreate(userId);

    preferences.favoriteProducts = preferences.favoriteProducts.filter(id => id !== productId);

    return await this.preferenceRepository.save(preferences);
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: {
      enableEmailNotifications?: boolean;
      enablePushNotifications?: boolean;
      enableSMSNotifications?: boolean;
      notifyOnDeals?: boolean;
      notifyOnBookingUpdates?: boolean;
    }
  ): Promise<UserPreference> {
    const userPreferences = await this.getOrCreate(userId);

    Object.assign(userPreferences, preferences);

    return await this.preferenceRepository.save(userPreferences);
  }

  async updatePrivacySettings(
    userId: string,
    settings: {
      allowPersonalizedRecommendations?: boolean;
      allowDataCollection?: boolean;
    }
  ): Promise<UserPreference> {
    const preferences = await this.getOrCreate(userId);

    if (settings.allowPersonalizedRecommendations !== undefined) {
      preferences.allowPersonalizedRecommendations = settings.allowPersonalizedRecommendations;
    }

    if (settings.allowDataCollection !== undefined) {
      preferences.allowDataCollection = settings.allowDataCollection;
    }

    return await this.preferenceRepository.save(preferences);
  }

  async delete(userId: string): Promise<void> {
    await this.preferenceRepository.delete({ userId });
  }
}
