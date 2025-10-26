import { useState, useEffect, useRef } from 'react';
import { useConsultationChat } from '../hooks/useConsultationChat';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Send, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConsultationChatWidgetProps {
  consultationId: string;
  token: string;
  userRole: 'user' | 'consultant';
}

export const ConsultationChatWidget = ({
  consultationId,
  token,
  userRole
}: ConsultationChatWidgetProps) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isUserTyping, setIsUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const {
    messages,
    isConnected,
    isTyping,
    participantJoined,
    sendMessage,
    sendTypingIndicator
  } = useConsultationChat({
    consultationId,
    token
  });

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputMessage.trim() || !isConnected) return;

    sendMessage(inputMessage);
    setInputMessage('');
    setIsUserTyping(false);
    sendTypingIndicator(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    // Enviar indicador de digitação
    if (!isUserTyping) {
      setIsUserTyping(true);
      sendTypingIndicator(true);
    }

    // Cancelar indicador após parar de digitar
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsUserTyping(false);
      sendTypingIndicator(false);
    }, 1000);
  };

  return (
    <Card className="flex flex-col h-[600px] max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Chat da Consulta</h3>
          <div className="flex items-center gap-2 mt-1">
            {isConnected ? (
              <>
                <Badge variant="success" className="text-xs">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Conectado
                </Badge>
                {participantJoined && (
                  <Badge variant="default" className="text-xs">
                    Participante online
                  </Badge>
                )}
              </>
            ) : (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Desconectado
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Nenhuma mensagem ainda.</p>
            <p className="text-sm mt-2">Envie a primeira mensagem para iniciar a conversa!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwn = (userRole === 'user' && message.sender_type === 'user') ||
                         (userRole === 'consultant' && message.sender_type === 'consultant');

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwn
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm font-medium mb-1">
                    {message.sender_type === 'user' ? 'Cliente' : 'Consultor'}
                  </p>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? 'text-purple-200' : 'text-gray-500'}`}>
                    {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}

        {/* Indicador de digitação */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-gray-500">Digitando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Digite sua mensagem..."
            disabled={!isConnected}
            className="flex-1"
            maxLength={1000}
          />
          <Button
            type="submit"
            disabled={!inputMessage.trim() || !isConnected}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {!isConnected ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">
            Conectando ao chat... Aguarde.
          </p>
        )}
      </form>
    </Card>
  );
};

