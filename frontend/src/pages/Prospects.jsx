import React from 'react';
import GenericModulePage from './GenericModulePage';

const config = {
  title: 'Prospects',
  endpoint: '/prospects',
  columns: [
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'stage', label: 'Stage' },
  ],
  fields: [
    { name: 'name', label: 'Name', required: true },
    { name: 'company', label: 'Company' },
    {
      name: 'stage',
      label: 'Stage',
      type: 'select',
      options: [
        { value: 'evaluating', label: 'Evaluating' },
        { value: 'negotiation', label: 'Negotiation' },
        { value: 'won', label: 'Won' },
        { value: 'lost', label: 'Lost' },
      ],
    },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
  emptyForm: { name: '', company: '', stage: 'evaluating', notes: '' },
};

export default function Prospects() {
  return <GenericModulePage config={config} />;
}
