'use client';

import { AntdRegistry } from '@ant-design/nextjs-registry';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { App, ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import { I18nProvider } from '@/lib/i18n/I18nContext';
import { useAuthStore } from '@/lib/store/authStore';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })
  );

  useEffect(() => {
    useAuthStore.persist.rehydrate();
  }, []);

  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <ConfigProvider locale={enUS} theme={{ token: { colorPrimary: '#1677ff' } }}>
            <App>
              <QueryClientProvider client={queryClient}>
                <I18nProvider>
                  {children}
                </I18nProvider>
              </QueryClientProvider>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
