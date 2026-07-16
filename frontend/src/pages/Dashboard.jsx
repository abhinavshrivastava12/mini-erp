import React, { useEffect, useState } from 'react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

function formatMinutes(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [me, setMe] = useState(null);
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    client
      .get('/auth/me')
      .then((res) => setMe(res.data.data))
      .catch(() => setError('Could not load profile details'));

    client
      .get('/sessions/current')
      .then((res) => setSession(res.data.data))
      .catch(() => setError((prev) => prev || 'Could not load session status'));
  }, []);

  return (
    <div>
      <h2>Welcome, {user?.full_name}</h2>
      <p style={{ color: '#6b7280' }}>Here's a snapshot of your account.</p>

      {error && <div className="error-banner">{error}</div>}

      <div className="card">
        <h3>Account details</h3>
        <table>
          <tbody>
            <tr>
              <th>Email</th>
              <td>{me?.email}</td>
            </tr>
            <tr>
              <th>Role</th>
              <td>
                <span className="badge">{me?.role_name}</span>
              </td>
            </tr>
            <tr>
              <th>Department</th>
              <td>{me?.department_id ?? '—'}</td>
            </tr>
            <tr>
              <th>Permissions</th>
              <td>{me?.permissions?.join(', ') || 'Loading...'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Session status</h3>
        {session ? (
          <table>
            <tbody>
              <tr>
                <th>Current session</th>
                <td>
                  <span className="badge">
                    {session.isActive ? 'Active (clocked in)' : 'Not active'}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Today's working hours</th>
                <td>
                  {formatMinutes(session.todayWorkingMinutes)} ({session.todayWorkingHours}h)
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p>Loading...</p>
        )}
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>
          Use the "Session Tracking" page in the sidebar to start/end your session.
        </p>
      </div>

      <div className="card">
        <h3>Quick links</h3>
        <p>
          Use the sidebar to manage the modules assigned to your role, and to track your work
          sessions and working hours.
        </p>
      </div>
    </div>
  );
}
