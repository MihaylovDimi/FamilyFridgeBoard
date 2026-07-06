import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTasks } from '../../hooks/useTasks';
import { useAuthStore } from '../../store/authStore';
import { Modal, ModalBody, ModalFooter } from '../ui/Modal';
import { EmptyState, LoadingSpinner, PriorityBadge } from '../ui/index';
import { isOverdue } from '../../services/firestore/tasks';
import type { Task, TaskInput, TaskPriority } from '../../types';

// ─── Task Card ────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: (t: Task) => void;
  onDelete: (id: string) => void;
}) {
  const overdue = isOverdue(task);
  const dueDate = task.dueDate?.toDate?.();

  return (
    <div className={`task-card${task.completed ? ' completed' : ''}`}>
      {/* Complete toggle */}
      <button
        type="button"
        className={`task-complete-btn${task.completed ? ' done' : ''}`}
        onClick={onToggle}
        aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
      >
        {task.completed && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Priority dot */}
      <div className={`priority-dot ${task.priority}`} />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p className="task-title">{task.title}</p>
        <p className="task-meta">
          <span style={{ color: 'var(--text-secondary)' }}>{task.assignedToName}</span>
          {dueDate && (
            <span className={overdue ? ' task-overdue' : ''}>
              {' '}· {overdue ? '⚠ Overdue — ' : ''}{format(dueDate, 'd MMM')}
            </span>
          )}
          {' '}· <PriorityBadge priority={task.priority} />
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
        <button
          className="btn btn-icon btn-sm"
          style={{ width: 26, height: 26, minHeight: 'unset' }}
          onClick={() => onEdit(task)}
          aria-label="Edit task"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button
          className="btn btn-icon btn-sm"
          style={{ width: 26, height: 26, minHeight: 'unset' }}
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Task Form ────────────────────────────────────────────────────────────────

function TaskForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: Task;
  onSubmit: (input: TaskInput) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const { members, uid } = useAuthStore();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [assignedTo, setAssignedTo] = useState(initial?.assignedTo ?? uid ?? '');
  const [priority, setPriority] = useState<TaskPriority>(initial?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState(
    initial?.dueDate ? format(initial.dueDate.toDate(), 'yyyy-MM-dd') : ''
  );
  const [error, setError] = useState('');

  const selectedMember = members.find((m) => m.uid === assignedTo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required.'); return; }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      assignedToName: selectedMember?.name ?? 'Unknown',
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <ModalBody>
        <div className="form-group">
          <label htmlFor="task-title">Task title</label>
          <input
            id="task-title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(''); }}
            placeholder="What needs to be done?"
            autoFocus
            maxLength={120}
          />
          {error && <span className="form-error">{error}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="task-desc">Details (optional)</label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any extra info…"
            rows={2}
            maxLength={300}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div className="form-group">
            <label htmlFor="task-assign">Assigned to</label>
            <select
              id="task-assign"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              {members.map((m) => (
                <option key={m.uid} value={m.uid}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="task-priority">Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="task-due">Due date (optional)</label>
          <input
            id="task-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Update task' : 'Add task'}
        </button>
      </ModalFooter>
    </form>
  );
}

// ─── Tasks Panel ──────────────────────────────────────────────────────────────

type FilterMode = 'all' | 'mine' | 'overdue';

export function TasksPanel() {
  const { tasks, loading, addTask, toggleTask, updateTask, deleteTask, clearCompleted } = useTasks();
  const { uid } = useAuthStore();

  const [filter, setFilter] = useState<FilterMode>('all');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => { setEditTarget(null); setShowModal(true); };
  const openEdit = (t: Task) => { setEditTarget(t); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditTarget(null); };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'mine') return t.assignedTo === uid;
    if (filter === 'overdue') return isOverdue(t);
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;
  const overdueCount   = tasks.filter((t) => isOverdue(t)).length;

  const handleSubmit = async (input: TaskInput) => {
    setSaving(true);
    try {
      if (editTarget) {
        await updateTask(editTarget.id, input);
      } else {
        await addTask(input);
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    await deleteTask(id);
  };

  return (
    <>
      {/* Panel header */}
      <div className="panel-header">
        <span className="panel-title" style={{ color: 'var(--accent-tasks)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Tasks
          {overdueCount > 0 && (
            <span className="badge badge-error" style={{ marginLeft: 4 }}>{overdueCount} overdue</span>
          )}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {completedCount > 0 && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={clearCompleted}
              style={{ fontSize: '0.6875rem', minHeight: 28, padding: '4px 8px' }}
            >
              Clear done
            </button>
          )}
          <button className="btn btn-icon btn-sm" onClick={openAdd} aria-label="Add task">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: '6px 8px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}
      >
        {(['all', 'mine', 'overdue'] as FilterMode[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--radius-xl)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 500,
              background: filter === f ? 'var(--accent-tasks)' : 'var(--bg-input)',
              color: filter === f ? '#fff' : 'var(--text-muted)',
              transition: 'background var(--transition)',
            }}
          >
            {f === 'all' ? 'All' : f === 'mine' ? 'Mine' : 'Overdue'}
          </button>
        ))}
      </div>

      {/* Panel body */}
      <div className="panel-body">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
            <LoadingSpinner />
          </div>
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon={filter === 'overdue' ? '✅' : '📋'}
            text={
              filter === 'overdue'
                ? 'No overdue tasks!'
                : filter === 'mine'
                ? 'No tasks assigned to you.'
                : 'No tasks yet. Tap + to add one.'
            }
          />
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id, !task.completed)}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editTarget ? 'Edit task' : 'New task'}
      >
        <TaskForm
          initial={editTarget ?? undefined}
          onSubmit={handleSubmit}
          onCancel={closeModal}
          loading={saving}
        />
      </Modal>
    </>
  );
}
