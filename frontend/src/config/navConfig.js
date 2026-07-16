// Maps each role to the sidebar items it should see.
// Every role gets Dashboard + Session Tracking; the rest is role-specific,
// matching the assessment's RBAC requirement that the sidebar changes
// automatically based on the authenticated user's role.

export const NAV_CONFIG = {
  admin: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sessions', label: 'Session Tracking' },
    { to: '/admin/users', label: 'Users' },
    { to: '/admin/roles', label: 'Roles' },
    { to: '/admin/departments', label: 'Departments' },
  ],
  sales: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sessions', label: 'Session Tracking' },
    { to: '/leads', label: 'Leads' },
    { to: '/prospects', label: 'Prospects' },
    { to: '/meetings', label: 'Meetings' },
  ],
  hr: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sessions', label: 'Session Tracking' },
    { to: '/job-announcements', label: 'Job Announcements' },
    { to: '/job-applications', label: 'Applications' },
    { to: '/candidates', label: 'Candidates' },
  ],
  engineering: [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/sessions', label: 'Session Tracking' },
    { to: '/projects', label: 'Projects' },
    { to: '/tasks', label: 'Tasks' },
  ],
};

export function getNavForRole(roleName) {
  return NAV_CONFIG[roleName] || [{ to: '/dashboard', label: 'Dashboard' }];
}
