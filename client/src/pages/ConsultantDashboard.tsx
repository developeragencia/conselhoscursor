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

  useEffect(() => {
    // Buscar dados do usuário
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
      window.location.href = '/login';
    });

    // Buscar estatísticas
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
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{fontSize: '18px'}}>Carregando...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userName = `${user.first_name || user.firstName || ''} ${user.last_name || user.lastName || ''}`.trim();

  return (
    <div style={{minHeight: '100vh', background: '#f3f4f6'}}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 style={{fontSize: '20px', fontWeight: '700', color: '#111827'}}>
                {userName || 'Consultor'}
              </h1>
              <p style={{fontSize: '14px', color: '#6b7280'}}>Painel do Consultor</p>
            </div>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            {/* Toggle Online */}
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <span style={{
                fontSize: '14px',
                fontWeight: '600',
                color: isOnline ? '#10b981' : '#6b7280'
              }}>
                {isOnline ? '🟢 Online' : '⚫ Offline'}
              </span>
              <button
                onClick={toggleOnline}
                style={{
                  width: '50px',
                  height: '28px',
                  borderRadius: '14px',
                  background: isOnline ? '#10b981' : '#d1d5db',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '3px',
                  left: isOnline ? '25px' : '3px',
                  transition: 'all 0.3s'
                }}></div>
              </button>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              🚪 Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{maxWidth: '1400px', margin: '0 auto', padding: '24px'}}>
        {/* Tabs */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '8px',
          marginBottom: '24px',
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
            { id: 'consultations', label: '💬 Consultas', icon: '💬' },
            { id: 'schedule', label: '📅 Agenda', icon: '📅' },
            { id: 'earnings', label: '💰 Ganhos', icon: '💰' },
            { id: 'profile', label: '👤 Perfil', icon: '👤' },
            { id: 'settings', label: '⚙️ Configurações', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              {[
                { title: 'Ganhos do Mês', value: `R$ ${stats.earnings.toFixed(2)}`, icon: '💰', color: '#10b981' },
                { title: 'Consultas', value: stats.consultations, icon: '💬', color: '#3b82f6' },
                { title: 'Avaliação', value: `${stats.rating.toFixed(1)} ⭐`, icon: '⭐', color: '#f59e0b' },
                { title: 'Avaliações', value: stats.reviews, icon: '📝', color: '#8b5cf6' }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                    <p style={{fontSize: '14px', color: '#6b7280', fontWeight: '500'}}>{stat.title}</p>
                    <span style={{fontSize: '24px'}}>{stat.icon}</span>
                  </div>
                  <p style={{
                    fontSize: '32px',
                    fontWeight: '800',
                    color: stat.color
                  }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h2 style={{fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827'}}>
                📋 Atividades Recentes
              </h2>
              <div style={{color: '#6b7280', textAlign: 'center', padding: '40px'}}>
                Nenhuma atividade recente
              </div>
            </div>
          </div>
        )}

        {/* Consultations Tab */}
        {activeTab === 'consultations' && (
          <div style={{background: 'white', borderRadius: '12px', padding: '24px'}}>
            <h2 style={{fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827'}}>
              💬 Minhas Consultas
            </h2>
            <div style={{color: '#6b7280', textAlign: 'center', padding: '40px'}}>
              Nenhuma consulta agendada
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div style={{background: 'white', borderRadius: '12px', padding: '24px'}}>
            <h2 style={{fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827'}}>
              📅 Minha Agenda
            </h2>
            <div style={{color: '#6b7280', textAlign: 'center', padding: '40px'}}>
              Agenda vazia
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div style={{background: 'white', borderRadius: '12px', padding: '24px'}}>
            <h2 style={{fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827'}}>
              💰 Relatório de Ganhos
            </h2>
            <div style={{marginBottom: '30px'}}>
              <p style={{fontSize: '36px', fontWeight: '800', color: '#10b981'}}>
                R$ {stats.earnings.toFixed(2)}
              </p>
              <p style={{fontSize: '14px', color: '#6b7280'}}>Total do mês atual</p>
            </div>
            <div style={{color: '#6b7280', textAlign: 'center', padding: '40px'}}>
              Nenhuma transação registrada
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{background: 'white', borderRadius: '12px', padding: '24px'}}>
            <h2 style={{fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827'}}>
              👤 Meu Perfil
            </h2>
            <div style={{display: 'grid', gap: '20px'}}>
              <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151'}}>
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={userName}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: '#f9fafb'
                  }}
                />
              </div>
              <div>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151'}}>
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: '#f9fafb'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{background: 'white', borderRadius: '12px', padding: '24px'}}>
            <h2 style={{fontSize: '20px', fontWeight: '700', marginBottom: '20px', color: '#111827'}}>
              ⚙️ Configurações
            </h2>
            <div style={{color: '#6b7280', textAlign: 'center', padding: '40px'}}>
              Configurações em breve
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
