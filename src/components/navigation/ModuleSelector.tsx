import { useTranslation } from 'react-i18next';
import { Module } from '../../types';

interface ModuleSelectorProps {
  modules: Module[];
  currentModule: number;
  onChange: (moduleId: number) => void;
}

export function ModuleSelector({ modules, currentModule, onChange }: ModuleSelectorProps) {
  const { t } = useTranslation();
  
  return (
    <select
      value={currentModule}
      onChange={(e) => onChange(Number(e.target.value))}
      className="select-chevron text-sm px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
      aria-label={t('selectModule')}
    >
      {modules.map((module) => (
        <option key={module.id} value={module.id}>
          {t(`module${module.id}` as any) || module.title}
        </option>
      ))}
    </select>
  );
}