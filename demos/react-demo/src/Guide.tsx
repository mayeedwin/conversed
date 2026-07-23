import { useEffect, useState } from 'react';
import { getSystemPromptInstruction } from '@conversed/core';

type Framework = 'react' | 'angular';
type Tab = 'how' | 'prompt' | Framework;

// The raw, framework-agnostic instruction — paste into any system prompt.
const RAW_INSTRUCTION = getSystemPromptInstruction();

const TABS: { id: Tab; label: string }[] = [
  { id: 'how', label: 'How it works' },
  { id: 'prompt', label: 'System prompt' },
  { id: 'react', label: 'React' },
  { id: 'angular', label: 'Angular' }
];

const PROMPT_SNIPPET = [
  "import { getSystemPromptInstruction } from '@conversed/core';",
  '',
  'const systemPrompt = `',
  'You are an AI assistant.',
  '${getSystemPromptInstruction()}',
  '`;'
].join('\n');

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
  const [tab, setTab] = useState<Tab>('how');
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

  const downloadRaw = () => {
    const blob = new Blob([RAW_INSTRUCTION], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'conversed-system-prompt.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="guide-backdrop" onClick={onClose}>
      <div
        className="guide"
        role="dialog"
        aria-modal="true"
        aria-label="How to use Conversed"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="guide-head">
          <h2 className="guide-title">Use Conversed in your app</h2>
          <button className="guide-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>

        <p className="guide-sub">
          Turn any LLM reply into structured, interactive UI blocks.
        </p>

        <div className="guide-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              className={`guide-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'how' ? (
          <div className="guide-how">
            <p className="guide-lead">
              <strong>Conversed</strong> turns an LLM’s reply into structured, interactive UI. It parses
              HTML or Markdown into a typed block AST, renders each block in your framework, and emits an
              event when someone clicks an actionable part. You keep your own chat shell — Conversed only
              fills the message content.
            </p>

            <ol className="guide-flow" aria-label="Pipeline">
              <li className="flow-step">
                <span className="flow-n">1</span>
                <span className="flow-t">Model reply</span>
                <span className="flow-d">HTML / Markdown</span>
              </li>
              <li className="flow-arrow" aria-hidden="true">→</li>
              <li className="flow-step">
                <span className="flow-n">2</span>
                <span className="flow-t">parseMessageBlocks</span>
                <span className="flow-d">typed AST blocks</span>
              </li>
              <li className="flow-arrow" aria-hidden="true">→</li>
              <li className="flow-step">
                <span className="flow-n">3</span>
                <span className="flow-t">ConversedContent</span>
                <span className="flow-d">renders blocks</span>
              </li>
              <li className="flow-arrow" aria-hidden="true">→</li>
              <li className="flow-step">
                <span className="flow-n">4</span>
                <span className="flow-t">onAction</span>
                <span className="flow-d">click events</span>
              </li>
            </ol>
          </div>
        ) : tab === 'prompt' ? (
          <>
            <p className="guide-lead">
              Give your model the block conventions with <code>getSystemPromptInstruction()</code> — it
              returns the HTML/Markdown shapes Conversed knows how to render.
            </p>
            <div className="guide-step">
              <span className="guide-step-label">TypeScript — call the helper</span>
              <div className="guide-code">
                <button className="guide-copy" onClick={() => copy('prompt', PROMPT_SNIPPET)}>
                  {copied === 'prompt' ? 'Copied' : 'Copy'}
                </button>
                <pre>
                  <code>{PROMPT_SNIPPET}</code>
                </pre>
              </div>
            </div>
            <div className="guide-step">
              <span className="guide-step-label">No TypeScript? Grab the raw instruction</span>
              <div className="guide-actions-row">
                <button className="guide-btn" onClick={() => copy('prompt-raw', RAW_INSTRUCTION)}>
                  {copied === 'prompt-raw' ? 'Copied' : 'Copy text'}
                </button>
                <button className="guide-btn" onClick={downloadRaw}>
                  Download .txt
                </button>
                <span className="guide-hint-inline">
                  Paste into any system prompt — {RAW_INSTRUCTION.length.toLocaleString()} chars
                </span>
              </div>
            </div>
            <p className="guide-note">
              Conversed renders <strong>content, not conversations</strong>. It never owns roles,
              avatars, or message bubbles — you drop <code>&lt;ConversedContent&gt;</code> inside your
              existing chat’s assistant bubble and hand it the parsed blocks. Its only input is{' '}
              <code>blocks</code>.
            </p>
          </>
        ) : (
          <>
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
          </>
        )}

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
