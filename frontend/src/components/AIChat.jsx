import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

import { endpoints } from '../config';

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Admission Assistant. How can I help you today with your college search or career goals?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Simplified chat endpoint logic - assuming direct call to AI for demo or new endpoint
            const response = await fetch(endpoints.aiChat, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to the brain right now. Please try again later." }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please make sure the server is running." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="glass"
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        fontSize: '1.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        background: 'var(--gradient-primary)',
                        boxShadow: 'var(--shadow-xl)',
                        color: 'white',
                        transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                    💬
                </button>
            ) : (
                <div className="glass-panel animate-fade-in" style={{
                    width: '380px',
                    height: '600px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    borderRadius: '24px',
                    border: '1px solid var(--glass-border)',
                    background: 'var(--glass-bg)',
                    backdropFilter: 'blur(20px)',
                    zIndex: 10000
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.2rem',
                        background: 'var(--gradient-primary)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🤖</div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>Admission Assistant</h3>
                                <div style={{ fontSize: '0.75rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%', display: 'inline-block' }}></span> Online
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'background 0.2s' }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', scrollBehavior: 'smooth', background: 'rgba(255,255,255,0.4)' }}>
                        {messages.map((m, i) => (
                            <div key={i} style={{
                                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                            }}>
                                <div style={{
                                    background: m.role === 'user' ? 'var(--gradient-primary)' : 'white',
                                    color: m.role === 'user' ? 'white' : 'var(--text-main)',
                                    padding: '0.8rem 1.2rem',
                                    borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    fontSize: '0.95rem',
                                    lineHeight: '1.5',
                                    boxShadow: 'var(--shadow-sm)',
                                    border: m.role === 'user' ? 'none' : '1px solid var(--border-color)'
                                }}>
                                    <ReactMarkdown components={{ p: ({ node, ...props }) => <p style={{ margin: 0 }} {...props} /> }}>
                                        {m.content}
                                    </ReactMarkdown>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', textAlign: m.role === 'user' ? 'right' : 'left', marginLeft: '4px', marginRight: '4px' }}>
                                    {m.role === 'user' ? 'You' : 'AI Assistant'}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ alignSelf: 'flex-start', padding: '0.8rem 1rem', background: 'white', borderRadius: '18px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                <span className="animate-pulse">Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} style={{ padding: '1rem', background: 'transparent', borderTop: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.8)', padding: '0.5rem', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about colleges, fees, or courses..."
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-main)',
                                    fontSize: '0.95rem',
                                    padding: '0.5rem 1rem',
                                    outline: 'none',
                                    boxShadow: 'none'
                                }}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                style={{
                                    background: input.trim() ? 'var(--primary-color)' : 'var(--text-muted)',
                                    opacity: input.trim() ? 1 : 0.5,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '40px',
                                    height: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: input.trim() ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                    transform: input.trim() ? 'scale(1)' : 'scale(0.95)'
                                }}
                            >
                                ➤
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AIChat;
