'use client';

import { useState, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { Footer } from '@/components/organisms/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { MapPin, Clock, Users, CreditCard, CheckCircle } from 'lucide-react';
import { formatCurrency, formatTime, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface Seat {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'selected';
  price: number;
  type: 'standard' | 'vip';
}

export default function BookingPage({ params }: { params: Promise<{ scheduleId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const passengers = parseInt(searchParams.get('passengers') || '1');

  const [step, setStep] = useState<'seats' | 'info' | 'payment' | 'confirm'>('seats');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data
  const schedule = {
    id: resolvedParams.scheduleId,
    origin: 'TP. Hồ Chí Minh',
    destination: 'Đà Lạt',
    departureTime: '2024-12-25T07:00:00',
    arrivalTime: '2024-12-25T13:00:00',
    price: 200000,
    vehicleType: 'Giường nằm',
  };

  // Mock seats layout (6x8 = 48 seats)
  const [seats] = useState<Seat[]>(
    Array.from({ length: 48 }, (_, i) => {
      const row = String.fromCharCode(65 + Math.floor(i / 8));
      const col = (i % 8) + 1;
      const isOccupied = Math.random() < 0.3; // 30% occupied

      return {
        id: `${row}${col}`,
        number: `${row}${col}`,
        status: isOccupied ? 'occupied' : 'available',
        price: 200000,
        type: i < 16 ? 'vip' : 'standard',
      };
    })
  );

  const [passengerInfo, setPassengerInfo] = useState(
    Array.from({ length: passengers }, (_, i) => ({
      fullName: '',
      phoneNumber: '',
      email: '',
    }))
  );

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat || seat.status === 'occupied') return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seatId));
    } else {
      if (selectedSeats.length >= passengers) {
        toast.warning(`Bạn chỉ có thể chọn tối đa ${passengers} ghế`);
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleContinue = () => {
    if (step === 'seats') {
      if (selectedSeats.length !== passengers) {
        toast.error(`Vui lòng chọn ${passengers} ghế`);
        return;
      }
      setStep('info');
    } else if (step === 'info') {
      // Validate passenger info
      const isValid = passengerInfo.every((p) => p.fullName && p.phoneNumber);
      if (!isValid) {
        toast.error('Vui lòng điền đầy đủ thông tin hành khách');
        return;
      }
      setStep('payment');
    } else if (step === 'payment') {
      handleBooking();
    }
  };

  const handleBooking = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success('Đặt vé thành công!');
    router.push('/my-bookings');
  };

  const totalPrice = selectedSeats.length * schedule.price;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />

      <main className="flex-grow py-8">
        <div className="container-custom">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
              {[
                { key: 'seats', label: 'Chọn ghế', icon: Users },
                { key: 'info', label: 'Thông tin', icon: Users },
                { key: 'payment', label: 'Thanh toán', icon: CreditCard },
                { key: 'confirm', label: 'Hoàn tất', icon: CheckCircle },
              ].map((s, index) => {
                const Icon = s.icon;
                const isActive = step === s.key;
                const isCompleted =
                  (s.key === 'seats' && ['info', 'payment', 'confirm'].includes(step)) ||
                  (s.key === 'info' && ['payment', 'confirm'].includes(step)) ||
                  (s.key === 'payment' && step === 'confirm');

                return (
                  <div key={s.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-status-success text-white'
                            : isActive
                            ? 'bg-primary-blue text-white'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-600'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-sm mt-2 font-medium">{s.label}</span>
                    </div>
                    {index < 3 && (
                      <div
                        className={`w-16 h-1 mx-2 ${
                          isCompleted ? 'bg-status-success' : 'bg-gray-300 dark:bg-gray-700'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {step === 'seats' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Chọn ghế ngồi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Bus Layout */}
                    <div className="mb-6">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-gray-400 flex items-center justify-center">
                            <span className="text-xs">Tài xế</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-8 gap-2">
                          {seats.map((seat) => {
                            const isSelected = selectedSeats.includes(seat.id);
                            const isOccupied = seat.status === 'occupied';

                            return (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatClick(seat.id)}
                                disabled={isOccupied}
                                className={`aspect-square rounded-lg border-2 text-sm font-medium transition-all ${
                                  isOccupied
                                    ? 'bg-gray-400 border-gray-400 cursor-not-allowed text-white'
                                    : isSelected
                                    ? 'bg-primary-blue border-primary-blue text-white animate-seat-pulse'
                                    : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-primary-blue'
                                }`}
                              >
                                {seat.number}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-white dark:bg-gray-700 border-2 border-gray-300" />
                          <span className="text-sm">Trống</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-primary-blue" />
                          <span className="text-sm">Đã chọn</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded bg-gray-400" />
                          <span className="text-sm">Đã đặt</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 'info' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Thông tin hành khách</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {passengerInfo.map((passenger, index) => (
                        <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                          <h4 className="font-medium text-secondary-dark dark:text-white">
                            Hành khách {index + 1} - Ghế {selectedSeats[index]}
                          </h4>

                          <Input
                            label="Họ và tên *"
                            placeholder="Nguyễn Văn A"
                            value={passenger.fullName}
                            onChange={(e) => {
                              const updated = [...passengerInfo];
                              updated[index].fullName = e.target.value;
                              setPassengerInfo(updated);
                            }}
                            required
                          />

                          <Input
                            label="Số điện thoại *"
                            type="tel"
                            placeholder="0901234567"
                            value={passenger.phoneNumber}
                            onChange={(e) => {
                              const updated = [...passengerInfo];
                              updated[index].phoneNumber = e.target.value;
                              setPassengerInfo(updated);
                            }}
                            required
                          />

                          <Input
                            label="Email"
                            type="email"
                            placeholder="email@example.com"
                            value={passenger.email}
                            onChange={(e) => {
                              const updated = [...passengerInfo];
                              updated[index].email = e.target.value;
                              setPassengerInfo(updated);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {step === 'payment' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Phương thức thanh toán</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { id: 'vnpay', name: 'VNPay', logo: '💳' },
                        { id: 'momo', name: 'Momo', logo: '📱' },
                        { id: 'zalopay', name: 'ZaloPay', logo: '💰' },
                      ].map((method) => (
                        <label
                          key={method.id}
                          className="flex items-center gap-4 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary-blue transition-colors"
                        >
                          <input type="radio" name="payment" className="w-5 h-5" />
                          <span className="text-2xl">{method.logo}</span>
                          <span className="font-medium">{method.name}</span>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Chi tiết đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trip Info */}
                  <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-primary-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{schedule.origin}</p>
                        <p className="text-sm text-secondary-gray">đến {schedule.destination}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-secondary-gray" />
                      <span>{formatDate(schedule.departureTime)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-secondary-gray" />
                      <span>
                        {formatTime(schedule.departureTime)} - {formatTime(schedule.arrivalTime)}
                      </span>
                    </div>

                    <Badge variant="primary">{schedule.vehicleType}</Badge>
                  </div>

                  {/* Selected Seats */}
                  {selectedSeats.length > 0 && (
                    <div className="space-y-2">
                      <p className="font-medium">Ghế đã chọn:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSeats.map((seat) => (
                          <Badge key={seat} variant="primary">
                            {seat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Price Breakdown */}
                  <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span>Giá vé ({selectedSeats.length}x)</span>
                      <span>{formatCurrency(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span>Tổng cộng:</span>
                      <span className="text-primary-blue">{formatCurrency(totalPrice)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-4">
                    {step !== 'confirm' && (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full"
                        onClick={handleContinue}
                        isLoading={isLoading}
                        disabled={step === 'seats' && selectedSeats.length === 0}
                      >
                        {step === 'payment' ? 'Thanh toán' : 'Tiếp tục'}
                      </Button>
                    )}

                    {step !== 'seats' && (
                      <Button
                        variant="outline"
                        size="md"
                        className="w-full mt-2"
                        onClick={() => {
                          if (step === 'info') setStep('seats');
                          else if (step === 'payment') setStep('info');
                        }}
                      >
                        Quay lại
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
