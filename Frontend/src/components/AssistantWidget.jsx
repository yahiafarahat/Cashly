import { useEffect, useRef, useState } from "react";
import { Bot, Send, X } from "lucide-react";

import "../styles/AssistantWidget.css";
import { sendAssistantMessage } from "../services/assistant";

function AssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isSending, isOpen]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    async function handleSend(event) {
        event.preventDefault();

        const trimmedMessage = inputValue.trim();

        if (!trimmedMessage || isSending) return;

        const history = messages;
        const userMessage = { role: "user", content: trimmedMessage };

        setMessages((current) => [...current, userMessage]);
        setInputValue("");
        setError("");
        setIsSending(true);

        try {
            const reply = await sendAssistantMessage(
                trimmedMessage,
                history
            );

            setMessages((current) => [
                ...current,
                { role: "assistant", content: reply },
            ]);
        } catch (askError) {
            setError(askError.message);
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="assistant-widget">
            {isOpen && (
                <div className="assistant-widget-panel">
                    <div className="assistant-widget-header">
                        <div className="assistant-widget-title">
                            <Bot size={18} />
                            <span>Cisho</span>
                        </div>

                        <button
                            type="button"
                            className="assistant-widget-close"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close assistant"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="assistant-widget-scroll">
                        {messages.length === 0 && (
                            <div className="assistant-widget-empty">
                                <Bot size={22} />
                                <p>
                                    Ask me anything about your transactions
                                    — spending by category, totals, trends,
                                    or a specific purchase.
                                </p>
                            </div>
                        )}

                        {messages.map((message, index) => (
                            <div
                                className={`assistant-widget-message assistant-widget-message-${message.role}`}
                                key={index}
                            >
                                <div className="assistant-widget-bubble">
                                    {message.content}
                                </div>
                            </div>
                        ))}

                        {isSending && (
                            <div className="assistant-widget-message assistant-widget-message-assistant">
                                <div className="assistant-widget-bubble assistant-widget-typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {error && (
                        <p className="assistant-widget-error">{error}</p>
                    )}

                    <form
                        className="assistant-widget-form"
                        onSubmit={handleSend}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Ask about your spending…"
                            value={inputValue}
                            onChange={(event) =>
                                setInputValue(event.target.value)
                            }
                            disabled={isSending}
                        />

                        <button
                            type="submit"
                            aria-label="Send message"
                            disabled={isSending || !inputValue.trim()}
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}

            <button
                type="button"
                className="assistant-widget-toggle"
                onClick={() => setIsOpen((current) => !current)}
                aria-label={
                    isOpen ? "Close Cisho" : "Open Cisho"
                }
            >
                {isOpen ? <X size={24} /> : <Bot size={24} />}
            </button>
        </div>
    );
}

export default AssistantWidget;
