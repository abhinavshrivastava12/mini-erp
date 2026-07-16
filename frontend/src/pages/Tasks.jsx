import React from 'react';
import GenericModulePage from './GenericModulePage';

const config = {
  title: 'Tasks',
  endpoint: '/tasks',
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'due_date', label: 'Due date' },
  ],
  fields: [
    { name: 'project_id', label: 'Project ID', required: true },
    { name: 'title', label: 'Title', required: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'todo', label: 'To do' },
        { value: 'in_progress', label: 'In progress' },
        { value: 'done', label: 'Done' },
      ],
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ],
    },
    { name: 'due_date', label: 'Due date', type: 'date' },
  ],
  emptyForm: { project_id: '', title: '', status: 'todo', priority: 'medium', due_date: '' },
};

export default function Tasks() {
  return <GenericModulePage config={config} />;
}
