import { useAppStore } from '../../store';

interface ChapterErrorProps {
  error: Error;
  onRetry: () => void;
}

export function ChapterError({ error, onRetry }: ChapterErrorProps) {
  const { language } = useAppStore();
  
  return (
    <div className="diagram-area flex items-center justify-center p-8" role="alert">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">
          {language === 'bn' ? 'অধ্যায় লোড করতে ব্যর্থ' : 'Failed to Load Chapter'}
        </h3>
        <p className="text-slate-500 text-sm mb-4">
          {error.message || (language === 'bn' ? 'অন المتوقع একটি ত্রুটি ঘটেছে' : 'An unexpected error occurred')}
        </p>
        <button
          onClick={onRetry}
          className="btn-primary"
        >
          {language === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Try Again'}
        </button>
      </div>
    </div>
  );
}