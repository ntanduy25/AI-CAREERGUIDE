import React from 'react';
import ReactMarkdown from 'react-markdown';

interface AIMarkdownRendererProps {
  content: string;
  className?: string;
  variant?: 'chat' | 'dossier';
}

export const AIMarkdownRenderer: React.FC<AIMarkdownRendererProps> = ({
  content,
  className = '',
  variant = 'chat',
}) => {
  if (!content) return null;

  return (
    <div className={`ai-markdown-content leading-relaxed text-slate-800 ${className}`}>
      <ReactMarkdown
        components={{
          p: ({ children }) => (
            <p className="my-1.5 text-[13px] sm:text-sm leading-relaxed text-slate-800">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-blue-950 bg-blue-50/80 px-1 py-0.5 rounded border border-blue-200/50">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-slate-700 font-medium">{children}</em>
          ),
          h1: ({ children }) => (
            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-3 mb-1.5 pb-1 border-b border-slate-200 flex items-center gap-1.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mt-2.5 mb-1 flex items-center gap-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[13.5px] sm:text-sm font-bold text-blue-900 mt-2 mb-1 flex items-center gap-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[13px] sm:text-xs font-bold text-slate-800 mt-1.5 mb-0.5">
              {children}
            </h4>
          ),
          ul: ({ children }) => (
            <ul className="my-2 space-y-1 pl-4 list-disc marker:text-blue-600 text-[13px] sm:text-sm text-slate-800">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 space-y-1 pl-4 list-decimal marker:text-blue-700 marker:font-semibold text-[13px] sm:text-sm text-slate-800">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed pl-1 text-[13px] sm:text-sm">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-blue-500 bg-blue-50/60 pl-3.5 py-1.5 my-2 rounded-r-md text-[13px] sm:text-sm text-slate-700 italic">
              {children}
            </blockquote>
          ),
          code: ({ children, className: codeClassName }) => {
            const isInline = !codeClassName;
            if (isInline) {
              return (
                <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto font-mono text-xs my-2">
                <code>{children}</code>
              </pre>
            );
          },
          hr: () => <hr className="my-3 border-slate-200" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
