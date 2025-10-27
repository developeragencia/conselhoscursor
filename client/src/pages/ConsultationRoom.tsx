import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';

export default function ConsultationRoom() {
  const [, params] = useRoute('/consultation/:roomId');
  const roomId = params?.roomId;
  
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [totalCharged, setTotalCharged] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    // Buscar dados da consulta
    fetch(`/api/consultations/${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setConsultation(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Erro ao carregar consulta:', err);
      setLoading(false);
    });

    // Cronômetro
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [roomId]);

  useEffect(() => {
    // Calcular valor cobrado
    if (consultation) {
      const pricePerMinute = parseFloat(consultation.price_per_minute_snapshot) || 0;
      const minutes = timeElapsed / 60;
      setTotalCharged(minutes * pricePerMinute);
    }
  }, [timeElapsed, consultation]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Simular resposta do consultor (em produção, via WebSocket)
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: 'consultant',
        text: 'Obrigado pela mensagem! Como posso te ajudar?',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  const endConsultation = async () => {
    const confirmar = confirm(
      `⚠️ Finalizar Consulta?\n\n` +
      `Tempo: ${Math.floor(timeElapsed / 60)}min ${timeElapsed % 60}s\n` +
      `Valor: R$ ${totalCharged.toFixed(2)}\n\n` +
      `Deseja realmente finalizar?`
    );

    if (!confirmar) return;

    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    try {
      const response = await fetch(`/api/consultations/${roomId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert(`✅ Consulta finalizada!\n\nValor cobrado: R$ ${totalCharged.toFixed(2)}`);
        window.location.href = '/';
      } else {
        const error = await response.json();
        alert(`❌ Erro: ${error.error}`);
      }
    } catch (err) {
      alert('❌ Erro ao finalizar consulta');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{textAlign: 'center', color: 'white'}}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{fontSize: '18px'}}>Conectando...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#1f2937',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h1 style={{fontSize: '32px', marginBottom: '20px'}}>❌ Consulta não encontrada</h1>
          <button
            onClick={() => window.location.href = '/consultores'}
            style={{
              padding: '12px 24px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Voltar aos Consultores
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#1f2937'
    }}>
      {/* Header */}
      <div style={{
        background: '#111827',
        padding: '20px',
        borderBottom: '2px solid #374151',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{color: 'white', fontSize: '24px', fontWeight: '700', marginBottom: '5px'}}>
            🔮 Consulta em Andamento
          </h1>
          <p style={{color: '#9ca3af', fontSize: '14px'}}>
            Consultor: {consultation.consultant?.name || 'Carregando...'}
          </p>
        </div>
        
        <div style={{textAlign: 'right'}}>
          <div style={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            padding: '12px 24px',
            borderRadius: '12px',
            marginBottom: '10px'
          }}>
            <div style={{color: 'white', fontSize: '32px', fontWeight: '800'}}>
              {formatTime(timeElapsed)}
            </div>
          </div>
          <div style={{
            background: '#374151',
            padding: '8px 16px',
            borderRadius: '8px'
          }}>
            <span style={{color: '#9ca3af', fontSize: '14px'}}>Valor: </span>
            <span style={{color: '#10b981', fontSize: '20px', fontWeight: '700'}}>
              R$ {totalCharged.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        background: '#1f2937'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#6b7280',
            marginTop: '100px'
          }}>
            <div style={{fontSize: '64px', marginBottom: '20px'}}>💬</div>
            <p style={{fontSize: '18px'}}>Inicie a conversa com o consultor</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                marginBottom: '15px',
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '12px 18px',
                borderRadius: '16px',
                background: msg.sender === 'user' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#374151',
                color: 'white'
              }}>
                <p style={{margin: 0, fontSize: '16px', lineHeight: '1.5'}}>{msg.text}</p>
                <span style={{fontSize: '12px', opacity: 0.7, marginTop: '5px', display: 'block'}}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div style={{
        background: '#111827',
        padding: '20px',
        borderTop: '2px solid #374151'
      }}>
        <div style={{display: 'flex', gap: '15px', maxWidth: '1200px', margin: '0 auto'}}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Digite sua mensagem..."
            style={{
              flex: 1,
              padding: '16px',
              borderRadius: '12px',
              border: '2px solid #374151',
              background: '#1f2937',
              color: 'white',
              fontSize: '16px',
              outline: 'none'
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            📤 Enviar
          </button>
          <button
            onClick={endConsultation}
            style={{
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            🔚 Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}
