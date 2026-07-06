import React, { useState } from 'react';
import { useShopping } from '../../hooks/useShopping';
import { EmptyState, LoadingSpinner } from '../ui/index';
import type { ShoppingItem } from '../../types';

// ─── Checkbox ────────────────────────────────────────────────────────────────

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      className={`shopping-checkbox${checked ? ' checked' : ''}`}
      onClick={onChange}
      aria-pressed={checked}
      aria-label={checked ? 'Mark as needed' : 'Mark as purchased'}
    >
      {checked && (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </button>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function ShoppingItemRow({
  item,
  onToggle,
  onDelete,
}: {
  item: ShoppingItem;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="shopping-item">
      <Checkbox checked={item.purchased} onChange={onToggle} />
      <span className={`shopping-name${item.purchased ? ' purchased' : ''}`}>
        {item.name}
        {item.quantity > 1 && (
          <span style={{ color: 'var(--text-disabled)', marginLeft: 6 }}>
            × {item.quantity}
          </span>
        )}
      </span>
      <span className="shopping-added-by">{item.addedByName}</span>
      <button
        className="btn btn-icon btn-sm"
        style={{ width: 28, height: 28, minHeight: 'unset' }}
        onClick={onDelete}
        aria-label={`Remove ${item.name}`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ─── Add Item Form ────────────────────────────────────────────────────────────

function AddItemForm({ onAdd }: { onAdd: (name: string, qty: number) => Promise<void> }) {
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onAdd(name.trim(), qty);
      setName('');
      setQty(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: 'flex', gap: 6, padding: '8px 8px 0' }}
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Add an item…"
        style={{ flex: 1, minHeight: 36, padding: '6px 10px', fontSize: '0.875rem' }}
        maxLength={80}
        disabled={loading}
      />
      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
        min={1}
        max={99}
        style={{ width: 54, minHeight: 36, padding: '6px 8px', fontSize: '0.875rem', textAlign: 'center' }}
        aria-label="Quantity"
        disabled={loading}
      />
      <button
        type="submit"
        className="btn btn-success btn-sm"
        disabled={loading || !name.trim()}
        style={{ minHeight: 36, padding: '6px 14px', fontSize: '0.875rem' }}
      >
        {loading ? '…' : 'Add'}
      </button>
    </form>
  );
}

// ─── Shopping Panel ───────────────────────────────────────────────────────────

export function ShoppingPanel() {
  const { items, loading, addItem, toggleItem, deleteItem, clearPurchased } = useShopping();

  const purchased = items.filter((i) => i.purchased);
  const pending = items.filter((i) => !i.purchased);

  return (
    <>
      {/* Panel header */}
      <div className="panel-header">
        <span className="panel-title" style={{ color: 'var(--accent-shopping)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Shopping list
          {pending.length > 0 && (
            <span className="badge badge-teal" style={{ marginLeft: 4 }}>{pending.length}</span>
          )}
        </span>
        {purchased.length > 0 && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={clearPurchased}
            style={{ fontSize: '0.6875rem', minHeight: 28, padding: '4px 8px' }}
            title="Remove all purchased items"
          >
            Clear done
          </button>
        )}
      </div>

      {/* Panel body */}
      <div className="panel-body" style={{ paddingBottom: 0 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <LoadingSpinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon="🛒" text="Shopping list is empty." />
        ) : (
          items.map((item) => (
            <ShoppingItemRow
              key={item.id}
              item={item}
              onToggle={() => toggleItem(item.id, !item.purchased)}
              onDelete={() => deleteItem(item.id)}
            />
          ))
        )}
      </div>

      {/* Add item form pinned to bottom of panel */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: 'auto', padding: '0 0 8px' }}>
        <AddItemForm
          onAdd={(name, qty) => addItem({ name, quantity: qty })}
        />
      </div>
    </>
  );
}
