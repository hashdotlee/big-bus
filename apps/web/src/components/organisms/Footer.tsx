import Link from 'next/link';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Về Big Bus',
      links: [
        { label: 'Giới thiệu', href: '/about' },
        { label: 'Tuyển dụng', href: '/careers' },
        { label: 'Tin tức', href: '/news' },
        { label: 'Liên hệ', href: '/contact' },
      ],
    },
    {
      title: 'Hỗ trợ',
      links: [
        { label: 'Hướng dẫn đặt vé', href: '/guide' },
        { label: 'Chính sách hoàn vé', href: '/refund-policy' },
        { label: 'Điều khoản sử dụng', href: '/terms' },
        { label: 'Chính sách bảo mật', href: '/privacy' },
      ],
    },
    {
      title: 'Tuyến đường phổ biến',
      links: [
        { label: 'TP.HCM - Đà Lạt', href: '/routes/sgn-dlt' },
        { label: 'TP.HCM - Nha Trang', href: '/routes/sgn-nha' },
        { label: 'Hà Nội - Hải Phòng', href: '/routes/han-hp' },
        { label: 'Hà Nội - Sapa', href: '/routes/han-sapa' },
      ],
    },
  ];

  return (
    <footer className="bg-secondary-dark dark:bg-gray-950 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">BB</span>
              </div>
              <span className="text-xl font-bold text-white">Big Bus</span>
            </div>

            <p className="text-sm text-gray-400">
              Đặt vé xe khách nhanh chóng, an toàn và tiện lợi trên toàn quốc.
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary-blue" />
                <span>123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-primary-blue" />
                <span>1900 1234</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-primary-blue" />
                <span>support@bigbus.vn</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-700 hover:bg-primary-blue transition-colors flex items-center justify-center"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-700 hover:bg-primary-blue transition-colors flex items-center justify-center"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-700 hover:bg-primary-blue transition-colors flex items-center justify-center"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-white font-semibold text-lg">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-primary-blue transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} Big Bus. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <img
              src="/images/payment-methods.png"
              alt="Payment methods"
              className="h-8 opacity-70"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
