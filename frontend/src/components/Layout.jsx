import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNavForRole } from '../config/navConfig';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // The sidebar is built from the current user's role — this is what makes
  // navigation "dynamic": a sales user never even receives links to HR or
  // Engineering routes, and vice versa.
  const navItems = getNavForRole(user?.role_name);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Mini ERP</h1>
        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="user-info">
          <div>{user?.full_name}</div>
          <div>{user?.email}</div>
          <div className="badge">{user?.role_name}</div>
        </div>
        <button className="secondary" onClick={handleLogout}>
          Log out
        </button>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
