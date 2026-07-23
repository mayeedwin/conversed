import { useState, useRef, useEffect } from 'react';
import { ConversedContent } from '@conversed/react';
import type { AgentActionEvent } from '@conversed/core';
import '@conversed/react/styles.css';
import { DEMO_PRESET_PROMPTS, streamConsoleResponse } from './mockAi';
import type { ChatMessage, ConsoleLogEntry } from './mockAi';
import './App.css';

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: 'Welcome to Conversed Agent Studio & Console.\n\nUse the left prompt suggestions or type a message below. All AST parser events, stream chunks, and action triggers will be logged in real-time in the bottom developer console.',
      blocks: [
        {
          type: 'paragraph',
          html: 'Welcome to <strong>Conversed Agent Studio & Console</strong>.'
        },
        {
          type: 'callout',
          tone: 'info',
          badgeLabel: 'SYSTEM READY',
          title: 'Interactive Console Active',
          html: 'All AST parser iterations and action protocol triggers are logged live in the bottom console panel.'
        }
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  ]);

  const [logs, setLogs] = useState<ConsoleLogEntry[]>([
    {
      id: 'log-1',
      type: 'info',
      message: 'Conversed React Studio initialized.',
      data: { version: '0.0.1-rc.4', corePackage: '@conversed/core' },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'ast' | 'raw'>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const addLog = (type: ConsoleLogEntry['type'], message: string, data?: unknown) => {
    const entry: ConsoleLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      data,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setLogs((prev) => [...prev.slice(-100), entry]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSend = async (userPromptText?: string) => {
    const textToSend = userPromptText || input.trim();
    if (!textToSend || isStreaming) return;

    setInput('');
    addLog('info', `User Prompt Submitted: "${textToSend}"`);

    const userMsgId = Math.random().toString(36).substring(2, 9);
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    const matchedPreset = DEMO_PRESET_PROMPTS.find(
      (p) => p.userText.toLowerCase() === textToSend.toLowerCase() || p.id === textToSend
    );

    const targetMarkdown = matchedPreset
      ? matchedPreset.markdown
      : [
          '# 🤖 Conversed Response',
          '',
          `You asked: "${textToSend}"`,
          '',
          '> [!NOTE]',
          '> `@conversed/react` dynamically compiles LLM stream text into AST block nodes.',
          '',
          '<button data-action-type="prompt-submit" data-action-id="confirm-action">Confirm Action</button>'
        ].join('\n');

    const assistantMsgId = Math.random().toString(36).substring(2, 9);
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      blocks: [],
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsStreaming(true);
    addLog('stream', 'LLM Stream Opened. Consuming tokens...');

    for await (const update of streamConsoleResponse(targetMarkdown, 20)) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: update.text, blocks: update.blocks }
            : msg
        )
      );
      addLog('parser', `Parsed AST Chunk: ${update.blocks.length} Block(s)`, { blockTypes: update.blocks.map(b => b.type) });
    }

    setMessages((prev) =>
      prev.map((msg) => (msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg))
    );
    setIsStreaming(false);
    addLog('info', 'LLM Stream Complete. AST structure finalized.');
  };

  const handleAction = (event: AgentActionEvent) => {
    addLog('action', `⚡ ACTION EVENT DETECTED [${event.action.type}]`, {
      actionId: event.action.actionId,
      type: event.action.type,
      target: event.action.target,
      params: event.action.params
    });
  };

  const clearConsole = () => {
    setLogs([]);
  };

  const latestAssistantMessage = [...messages].reverse().find((m) => m.sender === 'assistant');

  return (
    <div className="console-shell">
      {/* Top Navbar */}
      <header className="console-header">
        <div className="brand">
          <span className="brand-logo">⚡</span>
          <span className="brand-title">Conversed AI Console Studio</span>
          <span className="brand-badge">React 19 AST Inspector</span>
        </div>

        <div className="header-view-tabs">
          <button
            className={`view-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Interactive Chat
          </button>
          <button
            className={`view-tab ${activeTab === 'ast' ? 'active' : ''}`}
            onClick={() => setActiveTab('ast')}
          >
            🌳 Live AST Tree ({latestAssistantMessage?.blocks?.length || 0})
          </button>
          <button
            className={`view-tab ${activeTab === 'raw' ? 'active' : ''}`}
            onClick={() => setActiveTab('raw')}
          >
            📝 Raw Stream Content
          </button>
        </div>
      </header>

      {/* Main Grid: Left Chat/AST Stage + Right Inspector & Bottom Console */}
      <div className="console-body">
        {/* Stage Area */}
        <main className="stage-area">
          {activeTab === 'chat' && (
            <div className="chat-container">
              <div className="messages-scroll">
                {messages.map((msg) => (
                  <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
                    <div className="avatar">{msg.sender === 'user' ? 'USER' : 'AI'}</div>
                    <div className="bubble-content">
                      <div className="meta">
                        <span className="name">{msg.sender === 'user' ? 'Developer' : 'Conversed Agent'}</span>
                        <span className="time">{msg.timestamp}</span>
                      </div>
                      <div className="body">
                        {msg.sender === 'user' ? (
                          <p>{msg.text}</p>
                        ) : msg.blocks && msg.blocks.length > 0 ? (
                          <ConversedContent blocks={msg.blocks} onAction={handleAction} debug />
                        ) : (
                          <div className="stream-loading">Streaming response tokens...</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="chat-input-bar">
                <div className="preset-chips">
                  {DEMO_PRESET_PROMPTS.map((p) => (
                    <button key={p.id} onClick={() => handleSend(p.userText)} disabled={isStreaming}>
                      {p.title}
                    </button>
                  ))}
                </div>

                <div className="input-field-group">
                  <input
                    type="text"
                    placeholder="Type a message or trigger an AI prompt..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button onClick={() => handleSend()} disabled={!input.trim() || isStreaming}>
                    Send ▶
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ast' && (
            <div className="ast-inspector-view">
              <h3>Parsed AST Block Tree</h3>
              <p className="sub">Real-time Abstract Syntax Tree generated by <code>@conversed/core</code> parser engine.</p>
              <pre className="json-tree">{JSON.stringify(latestAssistantMessage?.blocks || [], null, 2)}</pre>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="ast-inspector-view">
              <h3>Raw Stream Text</h3>
              <p className="sub">Raw LLM token stream output before normalization.</p>
              <pre className="json-tree">{latestAssistantMessage?.text || 'No stream text available.'}</pre>
            </div>
          )}
        </main>

        {/* Bottom Real-time Console Log Drawer */}
        <section className="bottom-console">
          <div className="console-bar-header">
            <span className="title">🖥️ Real-time Action & Parser Logs ({logs.length})</span>
            <button className="clear-btn" onClick={clearConsole}>Clear Console</button>
          </div>

          <div className="console-log-stream">
            {logs.map((log) => (
              <div key={log.id} className={`log-line type-${log.type}`}>
                <span className="log-time">[{log.timestamp}]</span>
                <span className="log-tag">{log.type.toUpperCase()}</span>
                <span className="log-msg">{log.message}</span>
                {log.data && (
                  <span className="log-data">{JSON.stringify(log.data)}</span>
                )}
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
