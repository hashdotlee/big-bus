import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { TrackingService, VehicleLocation } from './tracking.service';
import { UpdateLocationDto, TrackVehicleDto } from './dto';

@WebSocketGateway({
  namespace: '/tracking',
  cors: {
    origin: '*', // In production, specify allowed origins
    credentials: true,
  },
})
export class TrackingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  private readonly connectedClients: Map<string, Socket> = new Map();
  private readonly vehicleSubscriptions: Map<string, Set<string>> = new Map();

  constructor(private readonly trackingService: TrackingService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Tracking Gateway initialized');

    // Setup periodic cleanup of old locations (every 10 minutes)
    setInterval(() => {
      this.trackingService.cleanupOldLocations();
    }, 10 * 60 * 1000);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);

    // Clean up subscriptions for this client
    for (const [vehicleId, subscribers] of this.vehicleSubscriptions.entries()) {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.vehicleSubscriptions.delete(vehicleId);
      }
    }
  }

  /**
   * Client subscribes to track a specific vehicle
   */
  @SubscribeMessage('track_vehicle')
  async handleTrackVehicle(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TrackVehicleDto,
  ) {
    const { vehicleId } = data;

    this.logger.debug(`Client ${client.id} tracking vehicle ${vehicleId}`);

    // Add client to vehicle subscribers
    if (!this.vehicleSubscriptions.has(vehicleId)) {
      this.vehicleSubscriptions.set(vehicleId, new Set());
    }
    this.vehicleSubscriptions.get(vehicleId).add(client.id);

    // Join the vehicle room
    client.join(`vehicle:${vehicleId}`);

    // Send current location immediately
    const currentLocation = await this.trackingService.getVehicleLocation(vehicleId);
    if (currentLocation) {
      client.emit('location_update', currentLocation);
    } else {
      client.emit('error', {
        message: `Vehicle ${vehicleId} not found or has no location data`,
      });
    }

    return {
      success: true,
      message: `Tracking vehicle ${vehicleId}`,
    };
  }

  /**
   * Client unsubscribes from tracking a vehicle
   */
  @SubscribeMessage('untrack_vehicle')
  handleUntrackVehicle(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: TrackVehicleDto,
  ) {
    const { vehicleId } = data;

    this.logger.debug(`Client ${client.id} stopped tracking vehicle ${vehicleId}`);

    // Remove client from vehicle subscribers
    const subscribers = this.vehicleSubscriptions.get(vehicleId);
    if (subscribers) {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.vehicleSubscriptions.delete(vehicleId);
      }
    }

    // Leave the vehicle room
    client.leave(`vehicle:${vehicleId}`);

    return {
      success: true,
      message: `Stopped tracking vehicle ${vehicleId}`,
    };
  }

  /**
   * Driver/vehicle updates its location
   */
  @SubscribeMessage('update_location')
  async handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UpdateLocationDto,
  ) {
    try {
      // Update location in service
      const location = await this.trackingService.updateLocation(data);

      // Broadcast to all clients tracking this vehicle
      this.server
        .to(`vehicle:${data.vehicleId}`)
        .emit('location_update', location);

      // If schedule is specified, also broadcast to schedule room
      if (data.scheduleId) {
        this.server
          .to(`schedule:${data.scheduleId}`)
          .emit('location_update', location);
      }

      this.logger.debug(
        `Location updated for vehicle ${data.vehicleId}: [${data.latitude}, ${data.longitude}]`,
      );

      return {
        success: true,
        message: 'Location updated successfully',
        location,
      };
    } catch (error) {
      this.logger.error(`Failed to update location: ${error.message}`, error.stack);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Client subscribes to track all vehicles on a schedule
   */
  @SubscribeMessage('track_schedule')
  async handleTrackSchedule(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { scheduleId: string },
  ) {
    const { scheduleId } = data;

    this.logger.debug(`Client ${client.id} tracking schedule ${scheduleId}`);

    // Join the schedule room
    client.join(`schedule:${scheduleId}`);

    // Send current locations for this schedule
    const locations = await this.trackingService.getScheduleVehicleLocations(
      scheduleId,
    );

    client.emit('schedule_locations', {
      scheduleId,
      locations,
      count: locations.length,
    });

    return {
      success: true,
      message: `Tracking schedule ${scheduleId}`,
    };
  }

  /**
   * Get all active vehicle locations
   */
  @SubscribeMessage('get_all_locations')
  async handleGetAllLocations(@ConnectedSocket() client: Socket) {
    const locations = await this.trackingService.getAllActiveVehicleLocations();

    client.emit('all_locations', {
      locations,
      count: locations.length,
    });

    return {
      success: true,
      count: locations.length,
    };
  }

  /**
   * Broadcast location update to all subscribers (called from controller)
   */
  async broadcastLocationUpdate(location: VehicleLocation): Promise<void> {
    this.server
      .to(`vehicle:${location.vehicleId}`)
      .emit('location_update', location);

    if (location.scheduleId) {
      this.server
        .to(`schedule:${location.scheduleId}`)
        .emit('location_update', location);
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      connectedClients: this.connectedClients.size,
      trackedVehicles: this.vehicleSubscriptions.size,
      totalSubscriptions: Array.from(this.vehicleSubscriptions.values()).reduce(
        (sum, subs) => sum + subs.size,
        0,
      ),
    };
  }
}
