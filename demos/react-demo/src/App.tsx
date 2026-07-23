import { useState, useRef, useEffect } from 'react';
import { ConversedContent } from '@conversed/react';
import type { AgentActionEvent } from '@conversed/core';
import '@conversed/react/styles.css';
import { DEMO_PRESET_PROMPTS, streamConsoleResponse } from './mockAi';
import type { ChatMessage, ActionRecord } from './mockAi';
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

  const threadEndRef = useRef<HTMLDivElement>(null);

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

    for await (const update of streamConsoleResponse(markdown, 22)) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, text: update.text, blocks: update.blocks } : m
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
          <span className="brand-sep" aria-hidden="true">·</span>
          <span className="brand-sub">rich, interactive AI replies</span>
        </div>
        <a
          className="brand-tag"
          href="https://github.com/mayeedwin/conversed"
          target="_blank"
          rel="noreferrer"
        >
          conversed × react
        </a>
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
                    <ConversedContent
                      blocks={msg.blocks}
                      primaryColor={PRIMARY}
                      onAction={handleAction}
                    />
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
                    <span className="event-type">{TYPE_LABEL[a.type] ?? a.type}</span>
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
    </div>
  );
}

export default App;
