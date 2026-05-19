'use client';

import { useEffect } from 'react';
import { Dropdown, Typography, Space } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useAllRestaurants } from '@/lib/hooks/useRestaurants';
import { useRestaurantStore } from '@/lib/store/restaurantStore';

const { Text } = Typography;

export default function RestaurantSelector() {
  const { data, isLoading, isSuccess } = useAllRestaurants();
  const { selectedId, setSelectedId } = useRestaurantStore();

  useEffect(() => {
    if (!isSuccess || !data?.data?.length) return;
    // Only auto-select if nothing is selected or saved id is gone from the list
    if (selectedId && data.data.some((r) => r.id === selectedId)) return;
    setSelectedId(data.data[0].id);
  }, [isSuccess]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading || !data?.data) return null;

  const list = data.data;
  if (list.length === 0) return null;

  const selected = list.find((r) => r.id === selectedId) ?? list[0];

  if (list.length === 1) {
    return (
      <Text style={{ fontWeight: 500, fontSize: 13 }}>{selected.name}</Text>
    );
  }

  return (
    <Dropdown
      menu={{
        items: list.map((r) => ({ key: r.id, label: r.name })),
        selectedKeys: [selected.id],
        onClick: ({ key }) => setSelectedId(key),
      }}
      trigger={['click']}
    >
      <Space
        style={{ cursor: 'pointer', fontWeight: 500, fontSize: 13 }}
        onClick={(e) => e.preventDefault()}
      >
        {selected.name}
        <DownOutlined style={{ fontSize: 10, color: 'rgba(0,0,0,0.45)' }} />
      </Space>
    </Dropdown>
  );
}
