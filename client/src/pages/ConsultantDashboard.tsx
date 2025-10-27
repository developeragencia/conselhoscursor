import { useState, useEffect } from 'react';

export default function ConsultantDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState({
    earnings: 0,
    consultations: 0,
    rating: 0,
    reviews: 0
  });
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    specialty: '',
    hourlyRate: '',
    availability: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetch('/api/auth/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      setUser(data.user || data);
      setLoading(false);
    })
    .catch(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    });

    fetch('/api/consultations/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data) setStats(data);
    })
    .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  const toggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    try {
      await fetch('/api/consultants/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus ? 'online' : 'offline' })
      });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
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
          <p style={{fontSize: '22px', fontWeight: '600'}}>Carregando seu painel...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userName = `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim();

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'}}>
      {/* Header Premium */}
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '28px',
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }}>
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 style={{fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '4px'}}>
                {userName || 'Consultor'}
              </h1>
              <p style={{fontSize: '16px', color: 'rgba(255,255,255,0.9)'}}>
                ⭐ Especialista Verificado
              </p>
            </div>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
            {/* Toggle Online Premium */}
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              padding: '12px 20px',
              borderRadius: '50px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{
                fontSize: '16px',
                fontWeight: '700',
                color: 'white'
              }}>
                {isOnline ? '🟢 ONLINE' : '⚫ OFFLINE'}
              </span>
              <button
                onClick={toggleOnline}
                style={{
                  width: '56px',
                  height: '32px',
                  borderRadius: '16px',
                  background: isOnline ? '#10b981' : '#6b7280',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '3px',
                  left: isOnline ? '27px' : '3px',
                  transition: 'all 0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}></div>
              </button>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '12px 24px',
                background: 'rgba(239, 68, 68, 0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#dc2626'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)'}
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{maxWidth: '1400px', margin: '0 auto', padding: '30px 20px'}}>
        {/* Tabs Premium */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '12px',
          marginBottom: '30px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          overflowX: 'auto'
        }}>
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
            { id: 'consultations', label: '💬 Consultas', icon: '💬' },
            { id: 'schedule', label: '📅 Agenda', icon: '📅' },
            { id: 'earnings', label: '💰 Ganhos', icon: '💰' },
            { id: 'clients', label: '👥 Clientes', icon: '👥' },
            { id: 'profile', label: '👤 Perfil', icon: '👤' },
            { id: 'settings', label: '⚙️ Config', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 24px',
                border: 'none',
                borderRadius: '14px',
                background: activeTab === tab.id 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap',
                boxShadow: activeTab === tab.id ? '0 4px 6px rgba(102, 126, 234, 0.4)' : 'none'
              }}
              onMouseOver={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = '#f3f4f6';
                }
              }}
              onMouseOut={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards Premium */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '30px'
            }}>
              {[
                { 
                  title: 'Ganhos do Mês', 
                  value: `R$ ${(stats?.earnings || 0).toFixed(2)}`, 
                  icon: '💰', 
                  gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  trend: '+12%'
                },
                { 
                  title: 'Consultas Realizadas', 
                  value: stats?.consultations || 0, 
                  icon: '💬', 
                  gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  trend: '+8%'
                },
                { 
                  title: 'Avaliação Média', 
                  value: `${(stats?.rating || 0).toFixed(1)} ⭐`, 
                  icon: '⭐', 
                  gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  trend: '+0.3'
                },
                { 
                  title: 'Total de Avaliações', 
                  value: stats?.reviews || 0, 
                  icon: '📝', 
                  gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  trend: '+5'
                }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '28px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 12px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                }}
                >
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '120px',
                    height: '120px',
                    background: stat.gradient,
                    opacity: 0.1,
                    borderRadius: '50%',
                    transform: 'translate(40%, -40%)'
                  }}></div>
                  
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                    <p style={{fontSize: '15px', color: '#6b7280', fontWeight: '600'}}>{stat.title}</p>
                    <span style={{fontSize: '36px'}}>{stat.icon}</span>
                  </div>
                  
                  <p style={{
                    fontSize: '42px',
                    fontWeight: '900',
                    background: stat.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '8px'
                  }}>
                    {stat.value}
                  </p>
                  
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: '#d1fae5',
                    color: '#065f46',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '700'
                  }}>
                    ↗ {stat.trend} este mês
                  </div>
                </div>
              ))}
            </div>

            {/* Gráfico de Desempenho */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '30px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#111827'}}>
                📈 Desempenho dos Últimos 7 Dias
              </h2>
              
              <div style={{display: 'flex', gap: '12px', height: '200px', alignItems: 'flex-end'}}>
                {[65, 80, 75, 90, 85, 95, 100].map((height, i) => (
                  <div key={i} style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                    <div style={{
                      width: '100%',
                      height: `${height}%`,
                      background: `linear-gradient(180deg, #667eea ${height}%, #764ba2 100%)`,
                      borderRadius: '8px 8px 0 0',
                      position: 'relative',
                      transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scaleY(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scaleY(1)'}
                    >
                      <div style={{
                        position: 'absolute',
                        top: '-24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#667eea'
                      }}>
                        {Math.floor(height * 0.5)}
                      </div>
                    </div>
                    <span style={{fontSize: '13px', color: '#6b7280', fontWeight: '600'}}>
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Próximas Consultas */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{fontSize: '24px', fontWeight: '800', marginBottom: '24px', color: '#111827'}}>
                📋 Próximas Consultas
              </h2>
              <div style={{color: '#6b7280', textAlign: 'center', padding: '40px'}}>
                <div style={{fontSize: '64px', marginBottom: '16px'}}>📅</div>
                <p style={{fontSize: '18px'}}>Nenhuma consulta agendada</p>
                <p style={{fontSize: '14px', marginTop: '8px'}}>Quando clientes agendarem, aparecerão aqui</p>
              </div>
            </div>
          </div>
        )}

        {/* Outras Tabs */}
        {activeTab !== 'dashboard' && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            minHeight: '400px'
          }}>
            <h2 style={{fontSize: '28px', fontWeight: '800', marginBottom: '24px', color: '#111827'}}>
              {activeTab === 'consultations' && '💬 Minhas Consultas'}
              {activeTab === 'schedule' && '📅 Minha Agenda'}
              {activeTab === 'earnings' && '💰 Relatório de Ganhos'}
              {activeTab === 'clients' && '👥 Meus Clientes'}
              {activeTab === 'profile' && '👤 Meu Perfil'}
              {activeTab === 'settings' && '⚙️ Configurações'}
            </h2>
            
            <div style={{color: '#6b7280', textAlign: 'center', padding: '60px 20px'}}>
              <div style={{fontSize: '80px', marginBottom: '20px'}}>
                {activeTab === 'consultations' && '💬'}
                {activeTab === 'schedule' && '📅'}
                {activeTab === 'earnings' && '💰'}
                {activeTab === 'clients' && '👥'}
                {activeTab === 'profile' && '👤'}
                {activeTab === 'settings' && '⚙️'}
              </div>
              <p style={{fontSize: '20px', fontWeight: '600', color: '#374151'}}>Conteúdo em Desenvolvimento</p>
              <p style={{fontSize: '16px', marginTop: '12px'}}>Esta seção estará disponível em breve</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
