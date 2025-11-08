import { Shield, Zap, DollarSign, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/atoms/Card';

export function Features() {
  const features = [
    {
      icon: Shield,
      title: 'An toàn',
      description: 'Đảm bảo an toàn tuyệt đối với đội ngũ lái xe chuyên nghiệp và xe được bảo dưỡng định kỳ',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      icon: Zap,
      title: 'Nhanh chóng',
      description: 'Đặt vé online chỉ trong 2 phút, không cần đến bến xe',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      icon: DollarSign,
      title: 'Giá tốt',
      description: 'Cam kết giá vé cạnh tranh nhất thị trường với nhiều ưu đãi hấp dẫn',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      icon: Clock,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ chăm sóc khách hàng sẵn sàng hỗ trợ bạn mọi lúc mọi nơi',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-dark dark:text-white mb-4">
            Tại sao chọn Big Bus?
          </h2>
          <p className="text-lg text-secondary-gray max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến cho bạn trải nghiệm đặt vé và di chuyển tốt nhất
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                hover
                className="text-center"
              >
                <CardContent className="flex flex-col items-center p-6">
                  <div
                    className={`w-16 h-16 rounded-full ${feature.bgColor} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-dark dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-gray text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
