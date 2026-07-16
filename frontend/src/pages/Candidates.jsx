import React from 'react';
import GenericModulePage from './GenericModulePage';

const config = {
  title: 'Candidates',
  endpoint: '/candidates',
  columns: [
    { key: 'full_name', label: 'Name' },
    { key: 'position', label: 'Position' },
    { key: 'status', label: 'Status' },
  ],
  fields: [
    { name: 'full_name', label: 'Full name', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'position', label: 'Position' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'in_review', label: 'In review' },
        { value: 'interviewing', label: 'Interviewing' },
        { value: 'offered', label: 'Offered' },
        { value: 'hired', label: 'Hired' },
        { value: 'rejected', label: 'Rejected' },
      ],
    },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
  emptyForm: { full_name: '', email: '', position: '', status: 'in_review', notes: '' },
};

export default function Candidates() {
  return <GenericModulePage config={config} />;
}
