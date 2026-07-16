import React from 'react';
import GenericModulePage from './GenericModulePage';

const config = {
  title: 'Meetings',
  endpoint: '/meetings',
  columns: [
    { key: 'title', label: 'Title' },
    { key: 'with_whom', label: 'With' },
    { key: 'scheduled_at', label: 'Scheduled' },
    { key: 'status', label: 'Status' },
  ],
  fields: [
    { name: 'title', label: 'Title', required: true },
    { name: 'with_whom', label: 'With whom' },
    { name: 'scheduled_at', label: 'Scheduled at', type: 'datetime-local' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
  emptyForm: { title: '', with_whom: '', scheduled_at: '', status: 'scheduled', notes: '' },
};

export default function Meetings() {
  return <GenericModulePage config={config} />;
}
