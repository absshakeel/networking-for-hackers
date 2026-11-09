import React from 'react';
import { useTranslation } from 'react-i18next';
import { DiagramProps } from '../../../types';

const Chapter = React.memo(function Chapter(_props: DiagramProps) {
  const { t: _t } = useTranslation();
  
  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-slate-900 mb-1">Chapter</h3>
        <p className="text-slate-500 text-sm">Under construction</p>
      </div>
    </div>
  );
});

export default Chapter;
