'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Typography, Grid, Button } from 'antd';
import {
  UserOutlined,
  ShopOutlined,
  LogoutOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  MenuOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/lib/store/authStore';
import { useI18n } from '@/lib/i18n/I18nContext';
import { authApi } from '@/lib/api/auth';
import { meApi } from '@/lib/api/me';
import LanguageSwitcher from '@/components/layout/LanguageSwitcher';

const { Sider, Header, Content } = Layout;
const { Text } = Typography;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, refreshToken } = useAuthStore();

  const handleLogout = async () => {
    if (refreshToken) {
      try { await authApi.logout({ refreshToken }); } catch { /* ignore */ }
    }
    logout();
  };

  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [meName, setMeName] = useState<string | null>(null);
  const [meEmail, setMeEmail] = useState<string | null>(null);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.lg;

  useEffect(() => {
    const check = () => {
      const state = useAuthStore.getState();
      if (!state.isAuthenticated()) {
        router.replace('/login');
        return;
      }
      if (state.needsSetup) {
        router.replace('/setup-phone');
        return;
      }
      setMounted(true);
      meApi.get().then((me) => {
        const full = [me.firstName, me.lastName].filter(Boolean).join(' ');
        setMeName(full || null);
        setMeEmail(me.email);
      }).catch(() => {});
    };

    if (useAuthStore.persist.hasHydrated()) {
      check();
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(check);
    return unsub;
  }, [router]);

  // Auto-collapse sidebar when switching to mobile
  useEffect(() => {
    if (isMobile) setCollapsed(true);
    else setCollapsed(false);
  }, [isMobile]);

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
    { key: '/profile', icon: <IdcardOutlined />, label: t.nav.profile },
  ];

  const bottomItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t.nav.logout,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Overlay mask — closes sidebar when tapping outside on mobile */}
      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(0,0,0,0.45)',
          }}
        />
      )}
      <Sider
        theme="dark"
        width={220}
        collapsible
        collapsed={collapsed}
        collapsedWidth={0}
        trigger={null}
        onCollapse={setCollapsed}
        style={{
          display: 'flex',
          flexDirection: 'column',
          ...(isMobile ? {
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            height: '100vh',
            zIndex: 1000,
          } : {}),
        }}
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
            onClick={({ key }) => { router.push(key); if (isMobile) setCollapsed(true); }}
          />
          <Menu
            theme="dark"
            mode="inline"
            selectable={false}
            items={bottomItems}
          />
        </div>
      </Sider>
      <Layout style={isMobile ? { marginLeft: 0 } : {}}>
        <Header
          style={{
            background: '#fff',
            padding: `0 ${isMobile ? 12 : 24}px`,
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setCollapsed(false)}
              />
            )}
            {(meName || meEmail) ? (
              <Text type="secondary" style={{ fontSize: 13 }}>
                <UserOutlined style={{ marginRight: 6 }} />
                {meName && <span style={{ color: '#000', fontWeight: 500 }}>{meName}</span>}
                {!isMobile && meName && meEmail && <span style={{ margin: '0 4px' }}>·</span>}
                {!isMobile && meEmail && <span>{meEmail}</span>}
              </Text>
            ) : <span />}
          </div>
          <LanguageSwitcher />
        </Header>
        <Content style={{ margin: isMobile ? 12 : 24 }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
