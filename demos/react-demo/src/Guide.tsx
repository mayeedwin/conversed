import { useEffect, useState } from 'react';

type Framework = 'react' | 'angular';

const INSTALL: Record<Framework, string> = {
  react: 'pnpm add @conversed/react @conversed/core',
  angular: 'pnpm add @conversed/angular @conversed/core'
};

const REACT_SNIPPET = [
  "import '@conversed/react/styles.css';",
  "import { ConversedContent } from '@conversed/react';",
  "import { parseMessageBlocks } from '@conversed/core';",
  '',
  'function Reply({ text }: { text: string }) {',
  '  const blocks = parseMessageBlocks(text);',
  '  return (',
  '    <ConversedContent',
  '      blocks={blocks}',
  '      primaryColor="#c96442"',
  '      onAction={(e) => console.log(e.action)}',
  '    />',
  '  );',
  '}'
].join('\n');

const ANGULAR_SNIPPET = [
  "import { Component, Input } from '@angular/core';",
  "import { ConversedContentComponent } from '@conversed/angular';",
  "import { parseMessageBlocks, AgentActionEvent } from '@conversed/core';",
  '',
  '@Component({',
  "  selector: 'app-reply',",
  '  standalone: true,',
  '  imports: [ConversedContentComponent],',
  '  template: `',
  '    <conversed-content',
  '      [blocks]="blocks"',
  '      primaryColor="#c96442"',
  '      (action)="onAction($event)">',
  '    </conversed-content>`',
  '})',
  'export class ReplyComponent {',
  "  @Input() text = '';",
  '  get blocks() { return parseMessageBlocks(this.text); }',
  '  onAction(e: AgentActionEvent) { console.log(e.action); }',
  '}'
].join('\n');

const SNIPPET: Record<Framework, string> = {
  react: REACT_SNIPPET,
  angular: ANGULAR_SNIPPET
};

export function Guide({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Framework>('react');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const copy = (label: string, text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied((c) => (c === label ? null : c)), 1200);
  };

  return (
    <div className="guide-backdrop" onClick={onClose}>
      <div
        className="guide"
        role="dialog"
        aria-modal="true"
        aria-label="How to use conversed"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="guide-head">
          <h2 className="guide-title">Use conversed in your app</h2>
          <button className="guide-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <p className="guide-lead">
          Parse the assistant’s reply into blocks, then render them. The host owns the chat — conversed
          only fills the message content.
        </p>

        <div className="guide-tabs" role="tablist">
          {(['react', 'angular'] as Framework[]).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={tab === f}
              className={`guide-tab ${tab === f ? 'active' : ''}`}
              onClick={() => setTab(f)}
            >
              {f === 'react' ? 'React' : 'Angular'}
            </button>
          ))}
        </div>

        <div className="guide-step">
          <span className="guide-step-label">1 · Install</span>
          <div className="guide-code">
            <button className="guide-copy" onClick={() => copy('install', INSTALL[tab])}>
              {copied === 'install' ? 'Copied' : 'Copy'}
            </button>
            <pre>
              <code>{INSTALL[tab]}</code>
            </pre>
          </div>
        </div>

        <div className="guide-step">
          <span className="guide-step-label">2 · Render a reply</span>
          <div className="guide-code">
            <button className="guide-copy" onClick={() => copy('snippet', SNIPPET[tab])}>
              {copied === 'snippet' ? 'Copied' : 'Copy'}
            </button>
            <pre>
              <code>{SNIPPET[tab]}</code>
            </pre>
          </div>
        </div>

        <p className="guide-foot">
          Full guides in the{' '}
          <a href="https://github.com/mayeedwin/conversed#documentation" target="_blank" rel="noreferrer">
            documentation
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default Guide;
