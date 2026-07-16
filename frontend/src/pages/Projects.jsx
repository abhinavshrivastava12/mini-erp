import React from 'react';
import GenericModulePage from './GenericModulePage';

const config = {
  title: 'Projects',
  endpoint: '/projects',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' },
    { key: 'due_date', label: 'Due date' },
  ],
  fields: [
    { name: 'name', label: 'Project name', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'planned', label: 'Planned' },
        { value: 'in_progress', label: 'In progress' },
        { value: 'done', label: 'Done' },
      ],
    },
    { name: 'due_date', label: 'Due date', type: 'date' },
  ],
  emptyForm: { name: '', description: '', status: 'planned', due_date: '' },
};

export default function Projects() {
  return <GenericModulePage config={config} />;
}
