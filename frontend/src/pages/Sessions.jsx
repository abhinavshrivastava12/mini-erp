import React, { useEffect, useState, useCallback } from 'react';
import client from '../api/client';

function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function Sessions() {
  const [current, setCurrent] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadCurrent = useCallback(() => {
    return client.get('/sessions/current').then((res) => setCurrent(res.data.data));
  }, []);

  const loadHistory = useCallback(() => {
    return client.get('/sessions/history').then((res) => setHistory(res.data.data));
  }, []);

  const loadAll = useCallback(() => {
    setError(null);
    Promise.all([loadCurrent(), loadHistory()]).catch(() =>
      setError('Could not load session data')
    );
  }, [loadCurrent, loadHistory]);

  useEffect(() => {
    loadAll();
    // Refresh "current" every 30s so the live working-hours counter stays fresh
    const interval = setInterval(loadCurrent, 30000);
    return () => clearInterval(interval);
  }, [loadAll, loadCurrent]);

  const handleStart = async () => {
    setBusy(true);
    setError(null);
    try {
      await client.post('/sessions/start');
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not start session');
    } finally {
      setBusy(false);
    }
  };

  const handleEnd = async () => {
    setBusy(true);
    setError(null);
    try {
      await client.post('/sessions/end');
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not end session');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <h2>Session Tracking</h2>
        <button className="secondary" onClick={loadAll}>
          Refresh
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <h3>Current status</h3>
        {current ? (
          <>
            <p>
              Status:{' '}
              <span className="badge">{current.isActive ? 'Active (clocked in)' : 'Not active'}</span>
            </p>
            {current.isActive && (
              <p>Started at: {new Date(current.startedAt).toLocaleString()}</p>
            )}
            <p>
              <strong>Today's working hours:</strong> {formatMinutes(current.todayWorkingMinutes)} (
              {current.todayWorkingHours}h)
            </p>
            <div style={{ marginTop: 12 }}>
              {current.isActive ? (
                <button className="danger" onClick={handleEnd} disabled={busy}>
                  {busy ? 'Ending...' : 'End Session'}
                </button>
              ) : (
                <button onClick={handleStart} disabled={busy}>
                  {busy ? 'Starting...' : 'Start Session'}
                </button>
              )}
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div className="card">
        <h3>Session history</h3>
        <table>
          <thead>
            <tr>
              <th>Started</th>
              <th>Ended</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((s) => (
              <tr key={s.id}>
                <td>{new Date(s.started_at).toLocaleString()}</td>
                <td>{s.ended_at ? new Date(s.ended_at).toLocaleString() : '—'}</td>
                <td>{s.duration_minutes != null ? formatMinutes(s.duration_minutes) : '—'}</td>
                <td>
                  <span className="badge">{s.is_active ? 'active' : 'ended'}</span>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={4}>No sessions recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
