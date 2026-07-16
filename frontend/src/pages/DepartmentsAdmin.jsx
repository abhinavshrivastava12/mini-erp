import React from 'react';
import GenericModulePage from './GenericModulePage';

const config = {
  title: 'Departments',
  endpoint: '/departments',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
  ],
  fields: [
    { name: 'name', label: 'Name', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
  emptyForm: { name: '', description: '' },
};

export default function DepartmentsAdmin() {
  return <GenericModulePage config={config} />;
}
