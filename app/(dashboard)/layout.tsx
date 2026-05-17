'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu } from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  LogoutOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/lib/store/authStore';
import { useI18n } from '@/lib/i18n/I18nContext';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

const { Sider, Header, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuthStore();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!mounted) return null;

  const menuItems = [
    { key: '/users', icon: <UserOutlined />, label: t.nav.users },
    { key: '/restaurants', icon: <ShopOutlined />, label: t.nav.restaurants },
  ];

  const bottomItems = [
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: t.nav.changePassword,
      onClick: () => router.push('/change-password'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t.nav.logout,
      onClick: logout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="dark"
        width={220}
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 18,
            fontWeight: 700,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          Tandur Admin
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[pathname]}
            items={menuItems}
            onClick={({ key }) => router.push(key)}
          />
          <Menu
            theme="dark"
            mode="inline"
            selectable={false}
            items={bottomItems}
          />
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <LanguageSwitcher />
        </Header>
        <Content style={{ margin: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
