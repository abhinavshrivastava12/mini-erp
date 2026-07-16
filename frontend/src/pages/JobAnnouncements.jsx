import React from 'react';
import GenericModulePage from './GenericModulePage';

const config = {
  title: 'Job Announcements',
  endpoint: '/job-announcements',
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
  ],
  fields: [
    { name: 'title', label: 'Title', required: true },
    { name: 'description', label: 'Description', type: 'textarea' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'open', label: 'Open' },
        { value: 'closed', label: 'Closed' },
      ],
    },
  ],
  emptyForm: { title: '', description: '', status: 'open' },
};

export default function JobAnnouncements() {
  return <GenericModulePage config={config} />;
}
