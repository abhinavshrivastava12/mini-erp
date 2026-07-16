import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';

import Leads from './pages/Leads';
import Prospects from './pages/Prospects';
import Meetings from './pages/Meetings';

import JobAnnouncements from './pages/JobAnnouncements';
import JobApplications from './pages/JobApplications';
import Candidates from './pages/Candidates';

import Projects from './pages/Projects';
import Tasks from './pages/Tasks';

import UsersAdmin from './pages/UsersAdmin';
import RolesAdmin from './pages/RolesAdmin';
import DepartmentsAdmin from './pages/DepartmentsAdmin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            {/* Available to every authenticated role */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/sessions" element={<Sessions />} />

            {/* Sales module - sales + admin */}
            <Route
              path="/leads"
              element={
                <RoleRoute allowedRoles={['sales', 'admin']}>
                  <Leads />
                </RoleRoute>
              }
            />
            <Route
              path="/prospects"
              element={
                <RoleRoute allowedRoles={['sales', 'admin']}>
                  <Prospects />
                </RoleRoute>
              }
            />
            <Route
              path="/meetings"
              element={
                <RoleRoute allowedRoles={['sales', 'admin']}>
                  <Meetings />
                </RoleRoute>
              }
            />

            {/* HR module - hr + admin */}
            <Route
              path="/job-announcements"
              element={
                <RoleRoute allowedRoles={['hr', 'admin']}>
                  <JobAnnouncements />
                </RoleRoute>
              }
            />
            <Route
              path="/job-applications"
              element={
                <RoleRoute allowedRoles={['hr', 'admin']}>
                  <JobApplications />
                </RoleRoute>
              }
            />
            <Route
              path="/candidates"
              element={
                <RoleRoute allowedRoles={['hr', 'admin']}>
                  <Candidates />
                </RoleRoute>
              }
            />

            {/* Engineering module - engineering + admin */}
            <Route
              path="/projects"
              element={
                <RoleRoute allowedRoles={['engineering', 'admin']}>
                  <Projects />
                </RoleRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <RoleRoute allowedRoles={['engineering', 'admin']}>
                  <Tasks />
                </RoleRoute>
              }
            />

            {/* Admin-only modules */}
            <Route
              path="/admin/users"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <UsersAdmin />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/roles"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <RolesAdmin />
                </RoleRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <DepartmentsAdmin />
                </RoleRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
