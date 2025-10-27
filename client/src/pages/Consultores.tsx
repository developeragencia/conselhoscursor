import { useState, useEffect } from 'react';

export default function Consultores() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userCredits, setUserCredits] = useState(null);

  useEffect(() => {
    // Buscar consultores
    fetch('/api/consultants?limit=50')
      .then(res => res.json())
      .then(data => {
        setConsultants(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Buscar créditos do usuário (se logado)
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      fetch('/api/auth/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        const user = data.user || data;
        setUserCredits(parseFloat(user.credits) || 0);
      })
      .catch(() => {});
    }
  }, []);

  const handleConsultClick = async (consultant) => {
    // Verificar se está logado
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      alert('⚠️ Você precisa fazer login para consultar!');
      window.location.href = '/login';
      return;
    }

    // Verificar créditos
    if (userCredits === null || userCredits < 5) {
      const confirmar = confirm(
        `💰 Você precisa de no mínimo R$ 5,00 em créditos para iniciar uma consulta.\n\n` +
        `Seu saldo atual: R$ ${(userCredits || 0).toFixed(2)}\n\n` +
        `Deseja comprar créditos agora?`
      );
      if (confirmar) {
        window.location.href = '/comprar/creditos';
      }
      return;
    }

    // Confirmar início da consulta
    const price = parseFloat(consultant.pricePerMinute) || 0;
    const confirmar = confirm(
      `🔮 Iniciar consulta com ${consultant.name}?\n\n` +
      `💰 Valor: R$ ${price.toFixed(2)}/minuto\n` +
      `💳 Seu saldo: R$ ${userCredits.toFixed(2)}\n\n` +
      `A cobrança será feita proporcionalmente ao tempo de consulta.`
    );

    if (!confirmar) return;

    // Iniciar consulta
    try {
      const response = await fetch('/api/consultations/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ consultant_id: consultant.id })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Consulta iniciada com sucesso!\n\nID: ${data.consultation.id}`);
        window.location.href = `/consultation/${data.consultation.id}`;
      } else {
        alert(`❌ Erro: ${data.error}`);
        if (data.error.includes('Créditos insuficientes')) {
          const comprar = confirm('Deseja comprar créditos agora?');
          if (comprar) {
            window.location.href = '/comprar/creditos';
          }
        }
      }
    } catch (err) {
      alert('❌ Erro ao iniciar consulta. Tente novamente.');
      console.error(err);
    }
  };

  const specialties = ['all', ...new Set(consultants.map(c => c.specialty))];

  const filteredConsultants = consultants.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchSpecialty = filterSpecialty === 'all' || c.specialty === filterSpecialty;
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchSpecialty && matchStatus;
  });

  const getStatusColor = (status) => {
    if (status === 'online') return '#10b981';
    if (status === 'busy') return '#f59e0b';
    return '#6b7280';
  };

  const getStatusText = (status) => {
    if (status === 'online') return 'Online';
    if (status === 'busy') return 'Ocupado';
    return 'Offline';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{textAlign: 'center', color: 'white'}}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '6px solid rgba(255,255,255,0.3)',
            borderTop: '6px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{fontSize: '24px', fontWeight: '600'}}>Carregando consultores...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '60px 20px'
    }}>
      <div style={{maxWidth: '1400px', margin: '0 auto'}}>
        {/* Header */}
        <div style={{textAlign: 'center', marginBottom: '50px'}}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '16px',
            textShadow: '0 4px 6px rgba(0,0,0,0.3)'
          }}>
            ✨ Nossos Consultores Especializados
          </h1>
          <p style={{fontSize: '22px', color: 'rgba(255,255,255,0.9)', fontWeight: '500'}}>
            {filteredConsultants.length} especialistas disponíveis
          </p>
          {userCredits !== null && (
            <div style={{
              marginTop: '20px',
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)',
              padding: '12px 24px',
              borderRadius: '20px',
              backdropFilter: 'blur(10px)'
            }}>
              <span style={{color: 'white', fontSize: '18px', fontWeight: '600'}}>
                💰 Seu saldo: R$ {userCredits.toFixed(2)}
              </span>
              <button
                onClick={() => window.location.href = '/comprar/creditos'}
                style={{
                  marginLeft: '12px',
                  padding: '6px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                + Comprar Créditos
              </button>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '30px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          marginBottom: '40px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {/* Busca */}
            <div>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151'}}>
                🔍 Buscar
              </label>
              <input
                type="text"
                placeholder="Nome ou especialidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filtro Especialidade */}
            <div>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151'}}>
                🎯 Especialidade
              </label>
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Todas</option>
                {specialties.filter(s => s !== 'all').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Filtro Status */}
            <div>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151'}}>
                🟢 Disponibilidade
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Todos</option>
                <option value="online">Online</option>
                <option value="busy">Ocupado</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grid de Consultores */}
        {filteredConsultants.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center'
          }}>
            <div style={{fontSize: '80px', marginBottom: '20px'}}>😔</div>
            <h2 style={{fontSize: '28px', color: '#374151', marginBottom: '10px'}}>
              Nenhum consultor encontrado
            </h2>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '30px'
          }}>
            {filteredConsultants.map((c) => {
              const price = parseFloat(c.pricePerMinute) || 0;
              const rating = parseFloat(c.rating) || 0;
              
              return (
                <div
                  key={c.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.2)';
                  }}
                >
                  {/* Imagem */}
                  <div style={{position: 'relative', height: '240px'}}>
                    <img 
                      src={c.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=667eea&color=fff&size=400`} 
                      alt={c.name}
                      style={{width: '100%', height: '100%', objectFit: 'cover'}}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      background: getStatusColor(c.status),
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '700',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                    }}>
                      {getStatusText(c.status)}
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div style={{padding: '24px'}}>
                    <h2 style={{fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '6px'}}>
                      {c.name}
                    </h2>
                    <p style={{fontSize: '15px', color: '#6b7280', marginBottom: '16px'}}>
                      {c.title}
                    </p>

                    {/* Rating */}
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
                      <div style={{display: 'flex', gap: '2px'}}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{fontSize: '18px', color: i < Math.floor(rating) ? '#fbbf24' : '#e5e7eb'}}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span style={{fontSize: '15px', color: '#6b7280', fontWeight: '600'}}>
                        {rating.toFixed(1)} ({c.reviewCount || 0})
                      </span>
                    </div>

                    {/* Descrição */}
                    <p style={{
                      fontSize: '14px',
                      color: '#4b5563',
                      lineHeight: '1.6',
                      marginBottom: '20px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {c.description}
                    </p>

                    {/* Footer */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: '20px',
                      borderTop: '2px solid #f3f4f6'
                    }}>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '800',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                      }}>
                        R$ {price.toFixed(2)}/min
                      </div>

                      {/* Botão Iniciar Consulta */}
                      <button
                        onClick={() => handleConsultClick(c)}
                        disabled={c.status !== 'online'}
                        style={{
                          padding: '12px 24px',
                          borderRadius: '12px',
                          background: c.status === 'online' 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                            : '#d1d5db',
                          border: 'none',
                          color: 'white',
                          fontSize: '16px',
                          fontWeight: '700',
                          cursor: c.status === 'online' ? 'pointer' : 'not-allowed',
                          transition: 'all 0.3s'
                        }}
                        title={c.status === 'online' ? 'Iniciar consulta' : 'Consultor indisponível'}
                      >
                        {c.status === 'online' ? '🔮 Consultar' : '⏸️ Indisponível'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
