import { useState, useEffect } from 'react';

export default function Consultores() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetch('/api/consultants?limit=50')
      .then(res => res.json())
      .then(data => {
        setConsultants(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
            {filteredConsultants.length} especialistas disponíveis para você
          </p>
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
                  outline: 'none',
                  transition: 'all 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                  cursor: 'pointer',
                  background: 'white'
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
                  cursor: 'pointer',
                  background: 'white'
                }}
              >
                <option value="all">Todos</option>
                <option value="online">Online</option>
                <option value="busy">Ocupado</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          {/* Botão Limpar */}
          {(searchTerm || filterSpecialty !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSpecialty('all');
                setFilterStatus('all');
              }}
              style={{
                marginTop: '20px',
                padding: '10px 24px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.background = '#dc2626'}
              onMouseOut={(e) => e.target.style.background = '#ef4444'}
            >
              🗑️ Limpar Filtros
            </button>
          )}
        </div>

        {/* Grid de Consultores */}
        {filteredConsultants.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{fontSize: '80px', marginBottom: '20px'}}>😔</div>
            <h2 style={{fontSize: '28px', color: '#374151', marginBottom: '10px'}}>
              Nenhum consultor encontrado
            </h2>
            <p style={{fontSize: '18px', color: '#6b7280'}}>
              Tente ajustar os filtros de busca
            </p>
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
                    transition: 'all 0.3s',
                    cursor: 'pointer'
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
                    {/* Badge Status */}
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
                      boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'white',
                        animation: c.status === 'online' ? 'pulse 2s infinite' : 'none'
                      }}></div>
                      {getStatusText(c.status)}
                    </div>
                    <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
                  </div>

                  {/* Conteúdo */}
                  <div style={{padding: '24px'}}>
                    <h2 style={{
                      fontSize: '24px',
                      fontWeight: '700',
                      color: '#111827',
                      marginBottom: '6px'
                    }}>
                      {c.name}
                    </h2>
                    <p style={{
                      fontSize: '15px',
                      color: '#6b7280',
                      marginBottom: '16px',
                      fontWeight: '500'
                    }}>
                      {c.title}
                    </p>

                    {/* Especialidade Badge */}
                    <div style={{
                      display: 'inline-block',
                      padding: '6px 14px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '16px'
                    }}>
                      🎯 {c.specialty}
                    </div>

                    {/* Rating */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px'
                    }}>
                      <div style={{display: 'flex', gap: '2px'}}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{
                            fontSize: '18px',
                            color: i < Math.floor(rating) ? '#fbbf24' : '#e5e7eb'
                          }}>
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

                      {/* Botões de Ação */}
                      <div style={{display: 'flex', gap: '10px'}}>
                        <button
                          onClick={() => window.location.href = `/chat/${c.id}`}
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            color: 'white',
                            fontSize: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Chat"
                          onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          💬
                        </button>
                        <button
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: '#10b981',
                            border: 'none',
                            color: 'white',
                            fontSize: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Ligar"
                          onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          📞
                        </button>
                      </div>
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
