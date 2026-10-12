import { useState } from 'react';
import './App.css';

const responseBank = [
  'I can help you think it through with a clear plan and simple next steps.',
  'That sounds interesting. Let’s break it into smaller actions so it feels manageable.',
  'A good next move is to start with one focused step and build from there.',
  'I’d suggest simplifying the idea first, then improving it as you go.',
  'The best approach here is to stay practical and keep the goal visible.',
  'You are on the right track. Small, consistent progress usually beats a big leap.',
  'Let’s focus on clarity first, then the execution will feel much easier.',
  'This is a strong idea. I’d refine the message, sharpen the goal, and test it quickly.',
  'Try thinking in terms of user value, then shape the experience around that.',
  'A clean solution usually comes from reducing complexity before adding features.',
  'I can help you define the problem, priorities, and the fastest path to progress.',
  'The real win is creating something useful, simple, and easy to trust.',
  'If you keep the user experience smooth, the rest often falls into place naturally.',
  'A smart move is to choose one clear outcome and build around that outcome.',
  'Start with the core question, then let the details support it instead of distract from it.',
  'Momentum matters most. Take a small action today and keep the direction consistent.',
  'Your idea has potential. It just needs a little structure and clearer intent.',
  'I’d make the experience feel polished, calm, and easy to understand.',
  'Focus on what helps people decide faster, trust more, and act with confidence.',
  'This can become a standout product if you keep the purpose sharp and the interface clean.'
];

const starterPrompts = ['Plan a launch', 'Improve my design', 'Write a better message'];

const formatMessageText = (text) => {
  const lines = text.split(/\n+/).filter((line) => line.trim());

  return lines.map((block, index) => {
    const isList = block
      .split('\n')
      .map((line) => line.trim())
      .some((line) => line.startsWith('- ') || line.startsWith('* '));

    if (isList) {
      const items = block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, itemIndex) => (
          <li key={`${index}-${itemIndex}`}>{line.replace(/^[-*]\s*/, '')}</li>
        ));

      return <ul key={index}>{items}</ul>;
    }

    return <p key={index}>{block}</p>;
  });
};

const getStaticReply = (value) => {
  const text = value.toLowerCase();

  if (text.includes('plan') || text.includes('launch') || text.includes('strategy')) {
    return 'I’d frame the plan around the audience, the goal, and a simple 3-step rollout.';
  }

  if (text.includes('design') || text.includes('ui') || text.includes('style')) {
    return 'A crystal-inspired UI works best when it feels elegant, spacious, and easy to scan.';
  }

  if (text.includes('message') || text.includes('copy') || text.includes('text')) {
    return 'Keep the message direct, warm, and outcome-focused so people understand the value quickly.';
  }

  if (text.includes('hello') || text.includes('hi')) {
    return 'Hi! I am ready to help. What would you like to create or improve?';
  }

  if (text.includes('help') || text.includes('idea') || text.includes('brainstorm')) {
    return 'Let’s turn the idea into a simple structure: problem, audience, value, and next step.';
  }

  if (text.includes('pricing') || text.includes('money') || text.includes('sale')) {
    return 'A strong pricing approach balances value, clarity, and confidence without overwhelming the user.';
  }

  if (text.includes('app') || text.includes('product') || text.includes('website')) {
    return 'Focus on a clean flow, clear calls to action, and a memorable first impression.';
  }

  const randomReply = responseBank[Math.floor(Math.random() * responseBank.length)];
  return randomReply;
};

const getGeminiReply = async (value) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return getStaticReply(value);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: value
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error('Gemini request failed');
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .join('')
      .trim();

    return text || getStaticReply(value);
  } catch (error) {
    return getStaticReply(value);
  }
};

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: 'Hello! I am Chromey. Tell me what you want to build or improve today.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: trimmed
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const botReply = await getGeminiReply(trimmed);

    setMessages((current) => [
      ...current,
      {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReply
      }
    ]);
    setIsLoading(false);
  };

  return (
    <div className="chat-shell">
      <div className="chat-panel">
        <aside className="sidebar">
          <div className="brand-wrap">
            <div className="brand-mark">C</div>
            <div>
              <span className="brand-label">Chromey</span>
              <small>AI workspace</small>
            </div>
          </div>

          <div className="nav-block">
            <p className="nav-title">Quick ideas</p>
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="prompt-chip"
                onClick={() => setInput(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </aside>

        <main className="chat-main">
          <header className="chat-header">
            <div>
              <p className="eyebrow">AI assistant</p>
              <h1>Chromey</h1>
            </div>
            <span className="status-pill">Online</span>
          </header>

          <section className="messages" aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message-row ${message.sender === 'user' ? 'user' : 'bot'}`}
              >
                <div className="message-bubble">
                  {formatMessageText(message.text)}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message-row bot">
                <div className="message-bubble typing-bubble" aria-live="polite">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
          </section>

          <form className="composer" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Chromey anything..."
              aria-label="Message input"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Thinking...' : 'Send'}
            </button>
          </form>
        </main>
      </div>

      <div className="glow glow-one" />
      <div className="glow glow-two" />
      <div className="glow glow-three" />
    </div>
  );
}

export default App;
