import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface ChatMessage {
  id: string;
  consultation_id: string;
  sender_type: 'user' | 'consultant';
  content: string;
  created_at: string;
}

interface UseConsultationChatOptions {
  consultationId: string | null;
  token: string | null;
  wsUrl?: string;
}

export const useConsultationChat = ({
  consultationId,
  token,
  wsUrl = `ws://${window.location.hostname}:5000/ws`
}: UseConsultationChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [participantJoined, setParticipantJoined] = useState(false);

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'joined_consultation':
        console.log('Joined consultation:', message.consultationId);
        break;

      case 'participant_joined':
        setParticipantJoined(true);
        console.log('Participant joined');
        break;

      case 'participant_left':
        setParticipantJoined(false);
        console.log('Participant left');
        break;

      case 'chat_message':
      case 'message_sent':
        setMessages(prev => [...prev, message.message]);
        break;

      case 'typing':
        setIsTyping(message.isTyping);
        setTimeout(() => setIsTyping(false), 3000); // Timeout de 3s
        break;

      case 'error':
        console.error('Chat error:', message.error);
        break;
    }
  }, []);

  const { isConnected, isAuthenticated, send } = useWebSocket({
    url: wsUrl,
    token,
    onMessage: handleMessage
  });

  // Entrar na consulta quando autenticado
  useEffect(() => {
    if (isAuthenticated && consultationId) {
      console.log('Joining consultation:', consultationId);
      send({
        type: 'join_consultation',
        consultationId
      });
    }
  }, [isAuthenticated, consultationId, send]);

  const sendMessage = useCallback((content: string) => {
    if (!consultationId) return;

    send({
      type: 'chat_message',
      content
    });
  }, [consultationId, send]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    send({
      type: 'typing',
      isTyping
    });
  }, [send]);

  const leaveConsultation = useCallback(() => {
    send({
      type: 'leave_consultation'
    });
  }, [send]);

  // Carregar mensagens anteriores via API
  useEffect(() => {
    if (!consultationId || !token) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/consultations/${consultationId}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [consultationId, token]);

  return {
    messages,
    isConnected,
    isTyping,
    participantJoined,
    sendMessage,
    sendTypingIndicator,
    leaveConsultation
  };
};

