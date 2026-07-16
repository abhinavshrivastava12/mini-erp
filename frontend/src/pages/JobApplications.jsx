import React from 'react';
import GenericModulePage from './GenericModulePage';

const config = {
  title: 'Job Applications',
  endpoint: '/job-applications',
  columns: [
    { key: 'applicant_name', label: 'Applicant' },
    { key: 'applicant_email', label: 'Email' },
    { key: 'status', label: 'Status' },
  ],
  fields: [
    { name: 'job_announcement_id', label: 'Job Announcement ID', required: true },
    { name: 'applicant_name', label: 'Applicant name', required: true },
    { name: 'applicant_email', label: 'Applicant email', type: 'email' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'submitted', label: 'Submitted' },
        { value: 'shortlisted', label: 'Shortlisted' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'hired', label: 'Hired' },
      ],
    },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ],
  emptyForm: { job_announcement_id: '', applicant_name: '', applicant_email: '', status: 'submitted', notes: '' },
};

export default function JobApplications() {
  return <GenericModulePage config={config} />;
}
