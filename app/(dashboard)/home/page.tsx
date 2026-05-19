'use client';

import { useState, useMemo, useEffect } from 'react';
import { Collapse, Button, Typography, App, Spin, Switch, Space, Popconfirm, Badge, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UnorderedListOutlined, MinusSquareOutlined, HolderOutlined, PictureOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useQuery } from '@tanstack/react-query';
import { menuApi } from '@/lib/api/menu';
import { useRestaurantStore } from '@/lib/store/restaurantStore';
import { useCreateCategory, useUpdateCategory, useDeleteCategory, usePatchCategory } from '@/lib/hooks/useCategories';
import { useCreateMenuItem, useUpdateMenuItem, usePatchMenuItem, useDeleteMenuItem } from '@/lib/hooks/useMenu';
import { useI18n } from '@/lib/i18n/I18nContext';
import { useQueryClient } from '@tanstack/react-query';
import CategoryModal, { CategoryFormValues } from '@/components/categories/CategoryModal';
import MenuItemModal, { MenuItemFormValues } from '@/components/menu/MenuItemModal';
import { Category, MenuItem } from '@/types/api';

const { Title, Text } = Typography;

// ── Item image ───────────────────────────────────────────────────────────────

const placeholder = (
  <div style={{
    width: 40, height: 40, borderRadius: 4, flexShrink: 0,
    background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }}>
    <PictureOutlined style={{ fontSize: 18, color: 'rgba(0,0,0,0.2)' }} />
  </div>
);

function ItemImage({ url, name }: { url: string | null; name: string }) {
  const [broken, setBroken] = useState(false);
  if (!url || broken) return placeholder;
  return (
    <img
      src={url}
      alt={name}
      onError={() => setBroken(true)}
      style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, flexShrink: 0 }}
    />
  );
}

// ── Item rows ────────────────────────────────────────────────────────────────

interface ItemsTableProps {
  catId: string;
  items: MenuItem[];
  t: ReturnType<typeof useI18n>['t'];
  patchItem: ReturnType<typeof usePatchMenuItem>;
  onToggle: (id: string, v: boolean) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
}

function ItemsTable({ catId, items, t, patchItem, onToggle, onEdit, onDelete }: ItemsTableProps) {
  return (
    <Droppable droppableId={catId} type="ITEM">
      {(dropProvided) => (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f0f0f0', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px', width: 24 }} />
                <th style={{ padding: '6px 8px', fontWeight: 500 }}>{t.menu.name}</th>
                <th style={{ padding: '6px 8px', fontWeight: 500 }}>{t.menu.price}</th>
                <th style={{ padding: '6px 8px', fontWeight: 500 }}>{t.menu.available}</th>
                <th style={{ padding: '6px 8px', width: 80 }} />
              </tr>
            </thead>
            <tbody ref={dropProvided.innerRef} {...dropProvided.droppableProps} style={{ minHeight: 40 }}>
              {items.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '8px', color: 'rgba(0,0,0,0.35)', fontSize: 12 }}>No items</td></tr>
              )}
              {items.map((item, idx) => (
                <Draggable key={item.id} draggableId={item.id} index={idx}>
                  {(dragProvided, dragSnapshot) => (
                    <tr
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      style={{
                        borderBottom: '1px solid #f9f9f9',
                        background: dragSnapshot.isDragging ? '#fafafa' : undefined,
                        ...dragProvided.draggableProps.style,
                      }}
                    >
                      <td style={{ padding: '6px 8px' }}>
                        <span {...dragProvided.dragHandleProps} style={{ cursor: 'grab', color: 'rgba(0,0,0,0.25)' }}>
                          <HolderOutlined />
                        </span>
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <ItemImage url={item.imageUrl} name={item.name} />
                          <div>
                            <div>{item.name}</div>
                            {item.shortDescription && (
                              <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12 }}>{item.shortDescription}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                        {item.price} {item.currency ?? ''}
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <Switch
                          size="small"
                          checked={item.isAvailable}
                          onChange={(v) => onToggle(item.id, v)}
                          loading={patchItem.isPending && patchItem.variables?.id === item.id}
                        />
                      </td>
                      <td style={{ padding: '6px 8px' }}>
                        <Space size={4}>
                          <Button size="small" icon={<EditOutlined />} type="text" onClick={() => onEdit(item)} />
                          <Popconfirm
                            title={t.menu.deleteConfirm}
                            onConfirm={() => onDelete(item.id)}
                            okText={t.common.yes}
                            cancelText={t.common.no}
                          >
                            <Button size="small" icon={<DeleteOutlined />} type="text" danger />
                          </Popconfirm>
                        </Space>
                      </td>
                    </tr>
                  )}
                </Draggable>
              ))}
              {dropProvided.placeholder}
            </tbody>
          </table>
        </div>
      )}
    </Droppable>
  );
}

// ── Category panel ────────────────────────────────────────────────────────────

interface CategoryPanelProps {
  cat: Category;
  items: MenuItem[];
  isOpen: boolean;
  dragHandleProps: DraggableProvidedDragHandleProps | null | undefined;
  t: ReturnType<typeof useI18n>['t'];
  patchItem: ReturnType<typeof usePatchMenuItem>;
  onToggleOpen: (id: string) => void;
  onEditCat: (cat: Category) => void;
  onDeleteCat: (id: string) => void;
  onAddItem: (catId: string) => void;
  onEditItem: (item: MenuItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleAvailable: (id: string, v: boolean) => void;
}

function CategoryPanel({
  cat, items, isOpen, dragHandleProps, t, patchItem,
  onToggleOpen, onEditCat, onDeleteCat, onAddItem, onEditItem, onDeleteItem, onToggleAvailable,
}: CategoryPanelProps) {
  const label = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span {...dragHandleProps} style={{ cursor: 'grab', color: 'rgba(0,0,0,0.25)', lineHeight: 1 }} onClick={(e) => e.stopPropagation()}>
        <HolderOutlined />
      </span>
      <span style={{ fontWeight: 500 }}>{cat.name}</span>
      <Badge count={items.length} color="blue" showZero />
      {!cat.isVisible && <Tag color="default">Hidden</Tag>}
      <Space size={4} onClick={(e) => e.stopPropagation()}>
        <Button size="small" icon={<EditOutlined />} type="text" onClick={() => onEditCat(cat)} />
        <Popconfirm
          title={t.categories.deleteConfirm}
          onConfirm={() => onDeleteCat(cat.id)}
          okText={t.common.yes}
          cancelText={t.common.no}
        >
          <Button size="small" icon={<DeleteOutlined />} type="text" danger />
        </Popconfirm>
      </Space>
    </div>
  );

  return (
    <Collapse
      activeKey={isOpen ? [cat.id] : []}
      onChange={() => onToggleOpen(cat.id)}
      items={[{
        key: cat.id,
        label,
        children: (
          <div>
            <Button
              size="small"
              icon={<PlusOutlined />}
              style={{ marginBottom: 12 }}
              onClick={() => onAddItem(cat.id)}
            >
              {t.menu.addButton}
            </Button>
            <ItemsTable
              catId={cat.id}
              items={items}
              t={t}
              patchItem={patchItem}
              onToggle={onToggleAvailable}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          </div>
        ),
      }]}
    />
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { t } = useI18n();
  const { message } = App.useApp();
  const qc = useQueryClient();
  const selectedId = useRestaurantStore((s) => s.selectedId);

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['full-menu', selectedId],
    queryFn: () => menuApi.getFullMenu(selectedId!),
    enabled: !!selectedId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['full-menu', selectedId] });

  const createCategory = useCreateCategory(selectedId ?? '');
  const updateCategory = useUpdateCategory(selectedId ?? '');
  const patchCategory = usePatchCategory(selectedId ?? '');
  const deleteCategory = useDeleteCategory(selectedId ?? '');

  const createItem = useCreateMenuItem(selectedId ?? '');
  const updateItem = useUpdateMenuItem(selectedId ?? '');
  const patchItem = usePatchMenuItem(selectedId ?? '');
  const deleteItem = useDeleteMenuItem(selectedId ?? '');

  const serverCategories = useMemo(() => menuData?.categories ?? [], [menuData]);
  const serverItems = useMemo(() => menuData?.items?.data ?? [], [menuData]);

  const [sortedCategories, setSortedCategories] = useState<Category[]>([]);
  const [sortedItems, setSortedItems] = useState<Record<string, MenuItem[]>>({});

  useEffect(() => {
    setSortedCategories([...serverCategories].sort((a, b) => a.sortOrder - b.sortOrder));
  }, [serverCategories]);

  useEffect(() => {
    const map: Record<string, MenuItem[]> = {};
    for (const item of serverItems) {
      if (!map[item.categoryId]) map[item.categoryId] = [];
      map[item.categoryId].push(item);
    }
    for (const key of Object.keys(map)) map[key].sort((a, b) => a.sortOrder - b.sortOrder);
    setSortedItems(map);
  }, [serverItems]);

  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const allExpanded = sortedCategories.length > 0 && activeKeys.length === sortedCategories.length;

  useEffect(() => {
    if (sortedCategories.length > 0 && activeKeys.length === 0) {
      setActiveKeys(sortedCategories.map((c) => c.id));
    }
  }, [sortedCategories.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemCategoryId, setItemCategoryId] = useState<string | null>(null);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    if (type === 'CATEGORY') {
      const reordered = [...sortedCategories];
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      setSortedCategories(reordered);
      try {
        await Promise.all(
          reordered.map((cat, idx) =>
            cat.sortOrder !== idx ? patchCategory.mutateAsync({ id: cat.id, data: { sortOrder: idx } }) : Promise.resolve()
          )
        );
        invalidate();
      } catch {
        message.error(t.categories.saveFailed);
        setSortedCategories([...serverCategories].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      return;
    }

    if (type === 'ITEM') {
      const srcCatId = source.droppableId;
      const dstCatId = destination.droppableId;
      const srcItems = [...(sortedItems[srcCatId] ?? [])];
      const [moved] = srcItems.splice(source.index, 1);

      let newSorted: Record<string, MenuItem[]>;
      if (srcCatId === dstCatId) {
        srcItems.splice(destination.index, 0, moved);
        newSorted = { ...sortedItems, [srcCatId]: srcItems };
      } else {
        const dstItems = [...(sortedItems[dstCatId] ?? [])];
        dstItems.splice(destination.index, 0, { ...moved, categoryId: dstCatId });
        newSorted = { ...sortedItems, [srcCatId]: srcItems, [dstCatId]: dstItems };
      }
      setSortedItems(newSorted);

      try {
        const patches: Promise<unknown>[] = [];
        if (srcCatId !== dstCatId) {
          // Change category + set sortOrder in destination
          patches.push(patchItem.mutateAsync({ id: moved.id, data: { categoryId: dstCatId, sortOrder: destination.index } }));
          // Re-order remaining items in source
          newSorted[srcCatId].forEach((item, idx) => {
            if (item.sortOrder !== idx) patches.push(patchItem.mutateAsync({ id: item.id, data: { sortOrder: idx } }));
          });
          // Re-order items in destination (skip moved, already patched)
          newSorted[dstCatId].forEach((item, idx) => {
            if (item.id !== moved.id && item.sortOrder !== idx) patches.push(patchItem.mutateAsync({ id: item.id, data: { sortOrder: idx } }));
          });
        } else {
          newSorted[srcCatId].forEach((item, idx) => {
            if (item.sortOrder !== idx) patches.push(patchItem.mutateAsync({ id: item.id, data: { sortOrder: idx } }));
          });
        }
        await Promise.all(patches);
        invalidate();
      } catch {
        message.error(t.menu.saveFailed);
        const map: Record<string, MenuItem[]> = {};
        for (const item of serverItems) {
          if (!map[item.categoryId]) map[item.categoryId] = [];
          map[item.categoryId].push(item);
        }
        setSortedItems(map);
      }
    }
  };

  const handleSaveCategory = async (values: CategoryFormValues) => {
    try {
      if (editingCat) await updateCategory.mutateAsync({ id: editingCat.id, data: values });
      else await createCategory.mutateAsync(values);
      invalidate();
      setCatModalOpen(false);
      setEditingCat(null);
      message.success(t.categories.saveSuccess);
    } catch {
      message.error(t.categories.saveFailed);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory.mutateAsync(id);
      invalidate();
      message.success(t.categories.deleteSuccess);
    } catch {
      message.error(t.categories.deleteFailed);
    }
  };

  const handleSaveItem = async (values: MenuItemFormValues) => {
    try {
      if (editingItem) await updateItem.mutateAsync({ id: editingItem.id, data: values });
      else await createItem.mutateAsync({ ...values, restaurantId: selectedId!, categoryId: itemCategoryId ?? values.categoryId });
      invalidate();
      setItemModalOpen(false);
      setEditingItem(null);
      message.success(t.menu.saveSuccess);
    } catch {
      message.error(t.menu.saveFailed);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem.mutateAsync(id);
      invalidate();
      message.success(t.menu.deleteSuccess);
    } catch {
      message.error(t.menu.deleteFailed);
    }
  };

  const handleToggleAvailable = async (id: string, isAvailable: boolean) => {
    try {
      await patchItem.mutateAsync({ id, data: { isAvailable } });
      invalidate();
    } catch {
      message.error(t.menu.availabilityFailed);
    }
  };

  if (!selectedId) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Text type="secondary">Select a restaurant to get started</Text>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <Title level={4} style={{ margin: 0 }}>{t.nav.home}</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCat(null); setCatModalOpen(true); }}>
            {t.categories.addButton}
          </Button>
        </div>

        {sortedCategories.length === 0 ? (
          <Text type="secondary">No categories yet. Add one to get started.</Text>
        ) : (
          <>
            <div style={{ marginBottom: 8 }}>
              <Button
                type="text"
                size="small"
                icon={allExpanded ? <MinusSquareOutlined /> : <UnorderedListOutlined />}
                onClick={() => setActiveKeys(allExpanded ? [] : sortedCategories.map((c) => c.id))}
              >
                {allExpanded ? 'Collapse all' : 'Expand all'}
              </Button>
            </div>
            <Droppable droppableId="categories" type="CATEGORY">
              {(dropProvided) => (
                <div ref={dropProvided.innerRef} {...dropProvided.droppableProps} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {sortedCategories.map((cat, idx) => (
                    <Draggable key={cat.id} draggableId={`cat-${cat.id}`} index={idx}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          style={{
                            borderRadius: 8,
                            background: dragSnapshot.isDragging ? '#f0f7ff' : undefined,
                            ...dragProvided.draggableProps.style,
                          }}
                        >
                          <CategoryPanel
                            cat={cat}
                            items={sortedItems[cat.id] ?? []}
                            isOpen={activeKeys.includes(cat.id)}
                            dragHandleProps={dragProvided.dragHandleProps}
                            t={t}
                            patchItem={patchItem}
                            onToggleOpen={(id) =>
                              setActiveKeys((prev) =>
                                prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
                              )
                            }
                            onEditCat={(c) => { setEditingCat(c); setCatModalOpen(true); }}
                            onDeleteCat={handleDeleteCategory}
                            onAddItem={(catId) => { setItemCategoryId(catId); setEditingItem(null); setItemModalOpen(true); }}
                            onEditItem={(item) => { setEditingItem(item); setItemCategoryId(item.categoryId); setItemModalOpen(true); }}
                            onDeleteItem={handleDeleteItem}
                            onToggleAvailable={handleToggleAvailable}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {dropProvided.placeholder}
                </div>
              )}
            </Droppable>
          </>
        )}

        <CategoryModal
          open={catModalOpen}
          onClose={() => { setCatModalOpen(false); setEditingCat(null); }}
          onSubmit={handleSaveCategory}
          initialValues={editingCat}
          loading={createCategory.isPending || updateCategory.isPending}
        />

        <MenuItemModal
          open={itemModalOpen}
          onClose={() => { setItemModalOpen(false); setEditingItem(null); setItemCategoryId(null); }}
          onSubmit={handleSaveItem}
          initialValues={editingItem}
          categories={sortedCategories}
          loading={createItem.isPending || updateItem.isPending}
        />
      </div>
    </DragDropContext>
  );
}
