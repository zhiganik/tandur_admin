'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Typography } from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  LogoutOutlined,
  LockOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/lib/store/authStore';
import { useI18n } from '@/lib/i18n/I18nContext';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

function parseJwt(token: string | null): { name: string | null; email: string | null } {
  if (!token) return { name: null, email: null };
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ?? payload.name ?? null,
      email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? payload.email ?? null,
    };
  } catch {
    return { name: null, email: null };
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, accessToken } = useAuthStore();
  const { name: currentName, email: currentEmail } = parseJwt(accessToken);
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const check = () => {
      setMounted(true);
      if (!useAuthStore.getState().isAuthenticated()) {
        router.replace('/login');
      }
    };

    if (useAuthStore.persist.hasHydrated()) {
      check();
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(check);
    return unsub;
  }, [router]);

  if (!mounted) return null;

  const selectedKey = pathname.startsWith('/restaurants/') && pathname.includes('/categories')
    ? '/categories'
    : pathname.startsWith('/restaurants/') && pathname.includes('/menu')
    ? '/menu'
    : pathname;

  const menuItems = [
    { key: '/users', icon: <UserOutlined />, label: t.nav.users },
    { key: '/restaurants', icon: <ShopOutlined />, label: t.nav.restaurants },
    { key: '/categories', icon: <AppstoreOutlined />, label: t.nav.categories },
    { key: '/menu', icon: <UnorderedListOutlined />, label: t.nav.menu },
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
            selectedKeys={[selectedKey]}
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
            justifyContent: 'space-between',
          }}
        >
          {(currentName || currentEmail) ? (
            <Text type="secondary" style={{ fontSize: 13 }}>
              <UserOutlined style={{ marginRight: 6 }} />
              {currentName && <span style={{ color: '#000', fontWeight: 500 }}>{currentName}</span>}
              {currentName && currentEmail && <span style={{ margin: '0 4px' }}>·</span>}
              {currentEmail && <span>{currentEmail}</span>}
            </Text>
          ) : <span />}
          <LanguageSwitcher />
        </Header>
        <Content style={{ margin: 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
