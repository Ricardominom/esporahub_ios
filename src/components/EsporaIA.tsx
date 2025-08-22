import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface EsporaIAProps {
    isOpen: boolean;
    onClose: () => void;
}

const EsporaIA: React.FC<EsporaIAProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: '¡Hola! Soy Espora IA, tu asistente inteligente. ¿En qué puedo ayudarte hoy?',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getAIResponse = async (userMessage: string): Promise<string> => {
        // Simulamos respuestas de IA (aquí puedes integrar con tu API real)
        const responses = [
            `Entiendo tu consulta sobre "${userMessage.slice(0, 20)}...". Te ayudo a resolverlo paso a paso.`,
            "Excelente pregunta. Basándome en mi conocimiento de Espora, puedo decirte que...",
            "Me parece una situación interesante. Te sugiero lo siguiente:",
            "Perfecto, puedo ayudarte con eso. La mejor manera de abordarlo es:",
            "Esa es una funcionalidad clave de nuestra plataforma. Te explico cómo funciona:",
        ];

        // Simulamos delay de respuesta
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        return responses[Math.floor(Math.random() * responses.length)];
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            const aiResponse = await getAIResponse(inputMessage);
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: aiResponse,
                sender: 'ai',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error al obtener respuesta de IA:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Lo siento, hubo un error al procesar tu mensaje. Inténtalo de nuevo.',
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="espora-ia-container">
            <div className={`espora-ia-chat ${isMinimized ? 'minimized' : ''}`}>
                {/* Header */}
                <div className="chat-header">
                    <div className="header-info">
                        <div className="ai-avatar">
                            <Bot size={20} />
                        </div>
                        <div className="header-text">
                            <h3>Espora IA</h3>
                            <span className="status">Asistente Inteligente</span>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button
                            className="minimize-btn"
                            onClick={() => setIsMinimized(!isMinimized)}
                        >
                            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                        </button>
                        <button className="close-btn" onClick={onClose}>
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                {!isMinimized && (
                    <>
                        <div className="messages-container">
                            {messages.map((message) => (
                                <div key={message.id} className={`message ${message.sender}`}>
                                    <div className="message-avatar">
                                        {message.sender === 'ai' ? <Bot size={16} /> : <User size={16} />}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-text">{message.text}</div>
                                        <div className="message-time">
                                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="message ai typing">
                                    <div className="message-avatar">
                                        <Bot size={16} />
                                    </div>
                                    <div className="message-content">
                                        <div className="typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="chat-input">
                            <div className="input-container">
                                <textarea
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu mensaje..."
                                    rows={1}
                                    disabled={isTyping}
                                />
                                <button
                                    className="send-btn"
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isTyping}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EsporaIA;
