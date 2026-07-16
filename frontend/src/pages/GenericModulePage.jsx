import React, { useEffect, useState } from 'react';
import client from '../api/client';

/**
 * Generic list + create/edit form + delete for any CRUD module.
 *
 * config = {
 *   title: string,
 *   endpoint: string,               // e.g. '/sales'
 *   columns: [{ key, label }],      // columns to show in the table
 *   fields: [{ name, label, type, options? }], // form fields
 *   emptyForm: { ...defaults }
 * }
 */
export default function GenericModulePage({ config }) {
  const { title, endpoint, columns, fields, emptyForm } = config;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    setLoading(true);
    client
      .get(endpoint)
      .then((res) => setItems(res.data.data))
      .catch((err) => setError(err.response?.data?.error?.message || 'Failed to load records'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [endpoint]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId) {
        await client.put(`${endpoint}/${editingId}`, form);
      } else {
        await client.post(endpoint, form);
      }
      resetForm();
      load();
    } catch (err) {
      const details = err.response?.data?.error?.details;
      setError(
        (Array.isArray(details) ? details.join(', ') : null) ||
          err.response?.data?.error?.message ||
          'Save failed'
      );
    }
  };

  const handleEdit = (item) => {
    const next = { ...emptyForm };
    Object.keys(next).forEach((key) => {
      if (item[key] !== undefined) next[key] = item[key];
    });
    setForm(next);
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await client.delete(`${endpoint}/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h2>{title}</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm((s) => !s);
          }}
        >
          {showForm ? 'Cancel' : `+ New ${title.replace(/s$/, '')}`}
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              {fields.map((f) => (
                <div key={f.name}>
                  <label>{f.label}</label>
                  {f.type === 'select' ? (
                    <select
                      value={form[f.name] ?? ''}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      required={f.required}
                    >
                      <option value="">-- select --</option>
                      {(f.options || []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      value={form[f.name] ?? ''}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <input
                      type={f.type || 'text'}
                      value={form[f.name] ?? ''}
                      onChange={(e) => handleChange(f.name, e.target.value)}
                      required={f.required}
                    />
                  )}
                </div>
              ))}
            </div>
            <button type="submit">{editingId ? 'Save changes' : 'Create'}</button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(item) : item[c.key]}</td>
                  ))}
                  <td>
                    <button className="secondary" onClick={() => handleEdit(item)}>
                      Edit
                    </button>{' '}
                    <button className="danger" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1}>No records yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
