import { useState, useRef, useEffect } from 'react';
import { ConversedContent } from '@conversed/react';
import { consumeConversedStream } from '@conversed/core';
import type { AgentActionEvent } from '@conversed/core';
import '@conversed/react/styles.css';
import { DEMO_PRESET_PROMPTS, mockTokenStream } from './mockAi';
import type { ChatMessage, ActionRecord } from './mockAi';
import { Guide } from './Guide';
import './App.css';

const PRIMARY = '#c96442';

const now = () =>
  new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

const uid = () => Math.random().toString(36).slice(2, 9);

const WELCOME: ChatMessage = {
  id: 'welcome',
  sender: 'assistant',
  text: '',
  blocks: [
    {
      type: 'paragraph',
      html: 'I’m <strong>Zao</strong>, your farm assistant. Ask about the herd, finances, or a how-to — I reply in rich, interactive blocks.'
    },
    {
      type: 'callout',
      tone: 'info',
      badgeLabel: 'TRY IT',
      title: 'Every reply is interactive',
      html: 'Click a table row, a stat card, or a follow-up chip. Each emits an <strong>Action Protocol</strong> event into the inspector →'
    },
    { type: 'followups', items: ['Give me an overview of my herd.', 'Show my financial summary.'] }
  ],
  timestamp: now()
};

const TYPE_LABEL: Record<string, string> = {
  navigate: 'navigate',
  'custom-command': 'command',
  'prompt-submit': 'prompt',
  'copy-code': 'copy',
  'external-url': 'link'
};

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [openSource, setOpenSource] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const threadEndRef = useRef<HTMLDivElement>(null);

  const toggleSource = (id: string) =>
    setOpenSource((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const copySource = (id: string, text: string) => {
    void navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1200);
  };

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (promptText?: string) => {
    const text = (promptText ?? input).trim();
    if (!text || isStreaming) return;

    setInput('');

    const preset = DEMO_PRESET_PROMPTS.find(
      (p) => p.userText.toLowerCase() === text.toLowerCase() || p.id === text
    );

    const markdown =
      preset?.markdown ??
      [
        '<h2>Got it</h2>',
        `<p>You asked: “${text}”. I don’t have that report wired up in this demo, but here are things I can show:</p>`,
        '<ul data-followups>',
        '  <li>Give me an overview of my herd.</li>',
        '  <li>Show my financial summary.</li>',
        '  <li>How do I vaccinate a new animal?</li>',
        '</ul>'
      ].join('\n');

    const userMsg: ChatMessage = { id: uid(), sender: 'user', text, timestamp: now() };
    const assistantId = uid();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      sender: 'assistant',
      text: '',
      blocks: [],
      isStreaming: true,
      timestamp: now()
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);

    // Parse the mock token stream with the library's own stream adapter.
    for await (const update of consumeConversedStream(mockTokenStream(markdown, 22))) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, text: update.rawText, blocks: update.blocks } : m
        )
      );
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
    );
    setIsStreaming(false);
  };

  const handleAction = (event: AgentActionEvent) => {
    const { action } = event;
    const record: ActionRecord = {
      id: uid(),
      type: action.type,
      actionId: action.actionId,
      target: action.target,
      params: action.params,
      blockType: action.metadata?.blockType,
      timestamp: now()
    };
    setActions((prev) => [record, ...prev].slice(0, 50));

    // Command actions update the row UI live (no navigation) — the button and
    // status change in place to reflect the new state.
    if (
      action.type === 'custom-command' &&
      action.target &&
      (action.actionId === 'task-start' || action.actionId === 'task-complete')
    ) {
      const target = action.target;
      const complete = action.actionId === 'task-complete';
      setMessages((prev) =>
        prev.map((m) => {
          if (!m.blocks) return m;
          let touched = false;
          const blocks = m.blocks.map((b) => {
            if (b.type !== 'table') return b;
            const rows = b.rows.map((row) => {
              if (!row.actions?.some((a) => a.action.target === target)) return row;
              touched = true;
              const cells = row.cells.slice();
              if (cells.length > 1) cells[1] = complete ? 'Done ✓' : 'In progress';
              const actions = complete
                ? [
                    {
                      label: 'Completed',
                      variant: 'primary' as const,
                      action: { type: 'custom-command' as const, actionId: 'task-done', target }
                    }
                  ]
                : (row.actions || []).filter((a) => a.action.actionId !== 'task-start');
              return { ...row, cells, actions };
            });
            return { ...b, rows };
          });
          return touched ? { ...m, blocks } : m;
        })
      );
    }

    // A follow-up chip is a real prompt — run it so the demo stays conversational.
    if (action.type === 'prompt-submit' && action.target) {
      void handleSend(action.target);
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">Z</span>
          <span className="brand-name">Zao</span>
          <span className="brand-ver" title="@conversed/core version">v{__CONVERSED_VERSION__}</span>
          <span className="brand-sep" aria-hidden="true">·</span>
          <span className="brand-sub">rich, interactive AI replies</span>
        </div>
        <div className="topbar-actions">
          <button className="use-it" onClick={() => setShowGuide(true)}>
            Use it
          </button>
          <nav className="topbar-links" aria-label="Project links">
            <a href="https://github.com/mayeedwin/conversed" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://www.npmjs.com/package/@conversed/react" target="_blank" rel="noreferrer">
              npm
            </a>
            <a
              href="https://github.com/mayeedwin/conversed#documentation"
              target="_blank"
              rel="noreferrer"
            >
              Docs
            </a>
          </nav>
        </div>
      </header>

      <div className="workspace">
        <main className="chat" aria-label="Conversation">
          <div className="thread">
            {messages.map((msg) => (
              <div key={msg.id} className={`turn ${msg.sender}`}>
                {msg.sender === 'assistant' && (
                  <span className="turn-avatar" aria-hidden="true">Z</span>
                )}
                <div className="turn-body">
                  {msg.sender === 'user' ? (
                    <div className="user-bubble">{msg.text}</div>
                  ) : msg.blocks && msg.blocks.length > 0 ? (
                    <>
                      <ConversedContent
                        blocks={msg.blocks}
                        primaryColor={PRIMARY}
                        onAction={handleAction}
                      />
                      {!msg.isStreaming && msg.text && (
                        <div className="source">
                          <button
                            className="source-toggle"
                            onClick={() => toggleSource(msg.id)}
                            aria-expanded={openSource.has(msg.id)}
                          >
                            <span className="chev" aria-hidden="true">
                              {openSource.has(msg.id) ? '▾' : '▸'}
                            </span>
                            {openSource.has(msg.id) ? 'Hide source' : 'View source'}
                          </button>
                          {openSource.has(msg.id) && (
                            <div className="source-block">
                              <button
                                className="source-copy"
                                onClick={() => copySource(msg.id, msg.text)}
                              >
                                {copiedId === msg.id ? 'Copied' : 'Copy'}
                              </button>
                              <pre>
                                <code>{msg.text}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="thinking" aria-label="Zao is replying">
                      <span className="caret" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={threadEndRef} />
          </div>

          <div className="composer">
            <div className="suggestions">
              {DEMO_PRESET_PROMPTS.map((p) => (
                <button
                  key={p.id}
                  className="chip"
                  onClick={() => handleSend(p.userText)}
                  disabled={isStreaming}
                >
                  {p.title}
                </button>
              ))}
            </div>
            <div className="input-row">
              <input
                type="text"
                placeholder="Message Zao…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isStreaming}
              />
              <button
                className="send"
                onClick={() => handleSend()}
                disabled={!input.trim() || isStreaming}
                aria-label="Send message"
              >
                ↑
              </button>
            </div>
          </div>
        </main>

        <aside className="inspector" aria-label="Action inspector">
          <div className="inspector-head">
            <div className="inspector-title">
              <span className={`pulse ${actions.length ? 'live' : ''}`} aria-hidden="true" />
              Action inspector
            </div>
            <div className="inspector-tools">
              <span className="count">{actions.length}</span>
              {actions.length > 0 && (
                <button className="clear" onClick={() => setActions([])}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <p className="inspector-hint">
            Events emitted by <code>onAction</code> as you interact with a reply.
          </p>

          <div className="events">
            {actions.length === 0 ? (
              <div className="empty">
                <span className="empty-mark" aria-hidden="true">⊹</span>
                <p className="empty-title">No events yet</p>
                <p className="empty-sub">
                  Click a table row, a stat card, or a follow-up chip in a reply to trigger one.
                </p>
              </div>
            ) : (
              actions.map((a) => (
                <article key={a.id} className={`event type-${a.type}`}>
                  <div className="event-top">
                    <span className="event-label">
                      <span className="event-dot" aria-hidden="true" />
                      <span className="event-type">{TYPE_LABEL[a.type] ?? a.type}</span>
                    </span>
                    <time className="event-time">{a.timestamp}</time>
                  </div>
                  <div className="event-id">{a.actionId}</div>
                  {a.target && (
                    <div className="event-target">
                      <span className="arrow" aria-hidden="true">→</span>
                      {a.target}
                    </div>
                  )}
                  {a.params && Object.keys(a.params).length > 0 && (
                    <pre className="event-params">{JSON.stringify(a.params, null, 2)}</pre>
                  )}
                </article>
              ))
            )}
          </div>
        </aside>
      </div>

      <Guide open={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}

export default App;
