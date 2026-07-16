import React from 'react';
import GenericModulePage from './GenericModulePage';

const config = {
  title: 'Users',
  endpoint: '/users',
  columns: [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role_name', label: 'Role' },
    { key: 'department_name', label: 'Department' },
    { key: 'is_active', label: 'Active', render: (item) => (item.is_active ? 'Yes' : 'No') },
  ],
  fields: [
    { name: 'full_name', label: 'Full name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: 'Password (leave blank to keep unchanged)', type: 'password' },
    { name: 'role_id', label: 'Role ID', required: true },
    { name: 'department_id', label: 'Department ID' },
  ],
  emptyForm: { full_name: '', email: '', password: '', role_id: '', department_id: '' },
};

export default function UsersAdmin() {
  return <GenericModulePage config={config} />;
}
