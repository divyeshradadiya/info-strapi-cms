import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Manager - Mobile',
  description: 'Mobile-friendly content management interface for Strapi',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  themeColor: '#4945ff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Content Manager',
  },
  formatDetection: {
    telephone: false,
  },
};
