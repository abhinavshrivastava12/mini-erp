import React from 'react';
import GenericModulePage from './GenericModulePage';

const config = {
  title: 'Leads',
  endpoint: '/leads',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'source', label: 'Source' },
    { key: 'status', label: 'Status' },
  ],
  fields: [
    { name: 'name', label: 'Name', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Phone' },
    { name: 'source', label: 'Source (e.g. website, referral)' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'qualified', label: 'Qualified' },
        { value: 'lost', label: 'Lost' },
      ],
    },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
  emptyForm: { name: '', email: '', phone: '', source: '', status: 'new', notes: '' },
};

export default function Leads() {
  return <GenericModulePage config={config} />;
}
