import { BaseApiClient } from '../base-client';
import { SERVICE_URLS } from '../config';

export interface SearchRoutesDto {
  origin: string;
  destination: string;
  date: string;
  passengers?: number;
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedDuration: number;
  price: number;
  stations: Station[];
}

export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Schedule {
  id: string;
  routeId: string;
  vehicleId: string;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  price: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  route?: Route;
  vehicle?: any;
}

export interface CreateBookingDto {
  scheduleId: string;
  seats: string[];
  passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  pickupStationId: string;
  dropoffStationId: string;
}

export interface Booking {
  id: string;
  userId: string;
  scheduleId: string;
  seats: string[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  qrCode?: string;
  passengerInfo: any;
  pickupStation: Station;
  dropoffStation: Station;
  schedule: Schedule;
  createdAt: string;
}

export class BookingService extends BaseApiClient {
  constructor() {
    super({ baseURL: SERVICE_URLS.booking });
  }

  // Routes
  async searchRoutes(params: SearchRoutesDto): Promise<Route[]> {
    return this.get('/routes/search', { params });
  }

  async getRoute(id: string): Promise<Route> {
    return this.get(`/routes/${id}`);
  }

  async getAllRoutes(): Promise<Route[]> {
    return this.get('/routes');
  }

  // Stations
  async getStations(): Promise<Station[]> {
    return this.get('/stations');
  }

  async getStation(id: string): Promise<Station> {
    return this.get(`/stations/${id}`);
  }

  async getStationsByCity(city: string): Promise<Station[]> {
    return this.get('/stations/by-city', { params: { city } });
  }

  // Schedules
  async getSchedules(params?: {
    routeId?: string;
    date?: string;
    status?: string;
  }): Promise<Schedule[]> {
    return this.get('/schedules', { params });
  }

  async getSchedule(id: string): Promise<Schedule> {
    return this.get(`/schedules/${id}`);
  }

  async getAvailableSeats(scheduleId: string): Promise<{
    total: number;
    available: number;
    occupied: string[];
  }> {
    return this.get(`/schedules/${scheduleId}/available-seats`);
  }

  // Bookings
  async createBooking(data: CreateBookingDto): Promise<Booking> {
    return this.post('/bookings', data);
  }

  async getMyBookings(): Promise<Booking[]> {
    return this.get('/bookings/my-bookings');
  }

  async getBooking(id: string): Promise<Booking> {
    return this.get(`/bookings/${id}`);
  }

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    return this.post(`/bookings/${id}/cancel`, { reason });
  }

  async confirmBooking(id: string): Promise<Booking> {
    return this.post(`/bookings/${id}/confirm`);
  }

  async getBookingQRCode(id: string): Promise<{ qrCode: string }> {
    return this.get(`/bookings/${id}/qr-code`);
  }
}
