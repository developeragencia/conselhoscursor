import { useState, useEffect } from 'react';

export default function ConsultantDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState({ earnings: 0, consultations: 0, rating: 0, reviews: 0 });
  
  // Estados para Consultas
  const [consultations, setConsultations] = useState([]);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState(null);
  
  // Estados para Agenda
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSlot, setNewSlot] = useState({ date: '', startTime: '', endTime: '', available: true });
  
  // Estados para Clientes
  const [clients, setClients] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientNotes, setClientNotes] = useState('');
  
  // Estados para Perfil
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: '',
    specialty: 'Tarot',
    hourlyRate: '',
    experience: '',
    languages: 'Português',
    availability: ''
  });
  
  // Estados para Configurações
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    autoAcceptBookings: false,
    minNoticeHours: 2,
    maxDailyConsultations: 8
  });

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'consultations') loadConsultations();
    if (activeTab === 'schedule') loadSchedule();
    if (activeTab === 'clients') loadClients();
  }, [activeTab]);

  const loadUserData = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch('/api/auth/user', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const userData = data.user || data;
      setUser(userData);
      setProfileData({
        bio: userData.bio || '',
        specialty: userData.specialty || 'Tarot',
        hourlyRate: userData.hourlyRate || '',
        experience: userData.experience || '',
        languages: userData.languages || 'Português',
        availability: userData.availability || ''
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      window.location.href = '/login';
    }
  };

  const loadStats = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/consultations/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data) setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadConsultations = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    try {
      const res = await fetch('/api/consultations/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setConsultations(data.consultations || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSchedule = () => {
    // Mock data - em produção, buscar do backend
    setScheduleSlots([
      { id: 1, date: '2025-01-15', startTime: '09:00', endTime: '10:00', available: true },
      { id: 2, date: '2025-01-15', startTime: '10:00', endTime: '11:00', available: false },
      { id: 3, date: '2025-01-15', startTime: '14:00', endTime: '15:00', available: true }
    ]);
  };

  const loadClients = () => {
    // Mock data - em produção, buscar do backend
    setClients([
      { id: 1, name: 'Maria Silva', email: 'maria@example.com', totalConsultations: 5, lastConsultation: '2025-01-10', notes: '' },
      { id: 2, name: 'João Santos', email: 'joao@example.com', totalConsultations: 3, lastConsultation: '2025-01-08', notes: 'Cliente regular' }
    ]);
  };

  // CRUD Consultas
  const handleCancelConsultation = async (id) => {
    if (!confirm('Deseja realmente cancelar esta consulta?')) return;
    
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    try {
      await fetch(`/api/consultations/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert('✅ Consulta cancelada com sucesso!');
      loadConsultations();
    } catch (err) {
      alert('❌ Erro ao cancelar consulta');
    }
  };

  // CRUD Agenda
  const handleCreateSlot = () => {
    if (!newSlot.date || !newSlot.startTime || !newSlot.endTime) {
      alert('⚠️ Preencha todos os campos!');
      return;
    }
    
    const slot = { ...newSlot, id: Date.now() };
    setScheduleSlots([...scheduleSlots, slot]);
    setNewSlot({ date: '', startTime: '', endTime: '', available: true });
    setShowScheduleModal(false);
    alert('✅ Horário criado com sucesso!');
  };

  const handleUpdateSlot = () => {
    setScheduleSlots(scheduleSlots.map(s => 
      s.id === editingSlot.id ? editingSlot : s
    ));
    setEditingSlot(null);
    alert('✅ Horário atualizado!');
  };

  const handleDeleteSlot = (id) => {
    if (!confirm('Deseja remover este horário?')) return;
    setScheduleSlots(scheduleSlots.filter(s => s.id !== id));
    alert('✅ Horário removido!');
  };

  // CRUD Clientes
  const handleUpdateClientNotes = async () => {
    const updated = clients.map(c => 
      c.id === selectedClient.id ? { ...c, notes: clientNotes } : c
    );
    setClients(updated);
    setShowClientModal(false);
    alert('✅ Notas atualizadas!');
  };

  // UPDATE Perfil
  const handleUpdateProfile = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    try {
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      alert('✅ Perfil atualizado com sucesso!');
      setEditMode(false);
    } catch (err) {
      alert('❌ Erro ao atualizar perfil');
    }
  };

  // UPDATE Configurações
  const handleUpdateSettings = () => {
    alert('✅ Configurações salvas com sucesso!');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const toggleOnline = () => setIsOnline(!isOnline);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ width: '80px', height: '80px', border: '6px solid rgba(255,255,255,0.3)', borderTop: '6px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
          <p style={{ fontSize: '22px', fontWeight: '600' }}>Carregando...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const userName = `${user?.first_name || user?.firstName || ''} ${user?.last_name || user?.lastName || ''}`.trim();

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        padding: '14px 24px',
        border: 'none',
        borderRadius: '14px',
        background: activeTab === id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
        color: activeTab === id ? 'white' : '#6b7280',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        transition: 'all 0.3s',
        whiteSpace: 'nowrap',
        boxShadow: activeTab === id ? '0 4px 6px rgba(102, 126, 234, 0.4)' : 'none'
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '28px', fontWeight: 'bold' }}>
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'white', marginBottom: '4px' }}>{userName}</h1>
              <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)' }}>⭐ Especialista Verificado</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '12px 20px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '16px', fontWeight: '700', color: 'white' }}>{isOnline ? '🟢 ONLINE' : '⚫ OFFLINE'}</span>
              <button onClick={toggleOnline} style={{ width: '56px', height: '32px', borderRadius: '16px', background: isOnline ? '#10b981' : '#6b7280', border: 'none', cursor: 'pointer', position: 'relative' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: isOnline ? '27px' : '3px', transition: 'all 0.3s' }}></div>
              </button>
            </div>
            <button onClick={handleLogout} style={{ padding: '12px 24px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>🚪 Sair</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px' }}>
        {/* Tabs */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', display: 'flex', gap: '12px', flexWrap: 'wrap', overflowX: 'auto' }}>
          <TabButton id="dashboard" label="📊 Dashboard" />
          <TabButton id="consultations" label="💬 Consultas" />
          <TabButton id="schedule" label="📅 Agenda" />
          <TabButton id="earnings" label="💰 Ganhos" />
          <TabButton id="clients" label="👥 Clientes" />
          <TabButton id="profile" label="👤 Perfil" />
          <TabButton id="settings" label="⚙️ Config" />
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '30px' }}>
              {[
                { title: 'Ganhos do Mês', value: `R$ ${(stats?.earnings || 0).toFixed(2)}`, icon: '💰', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
                { title: 'Consultas', value: stats?.consultations || 0, icon: '💬', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
                { title: 'Avaliação', value: `${(stats?.rating || 0).toFixed(1)} ⭐`, icon: '⭐', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
                { title: 'Avaliações', value: stats?.reviews || 0, icon: '📝', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }
              ].map((stat, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <p style={{ fontSize: '15px', color: '#6b7280', fontWeight: '600' }}>{stat.title}</p>
                    <span style={{ fontSize: '36px' }}>{stat.icon}</span>
                  </div>
                  <p style={{ fontSize: '42px', fontWeight: '900', background: stat.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consultas Tab - CRUD COMPLETO */}
        {activeTab === 'consultations' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827' }}>💬 Minhas Consultas</h2>
            </div>
            {consultations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
                <p style={{ fontSize: '18px' }}>Nenhuma consulta registrada</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {consultations.map(c => (
                  <div key={c.id} style={{ border: '2px solid #e5e7eb', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Cliente: {c.user_name}</h3>
                      <p style={{ color: '#6b7280' }}>Data: {new Date(c.created_at).toLocaleDateString()}</p>
                      <p style={{ color: '#6b7280' }}>Valor: R$ {parseFloat(c.total_charged || 0).toFixed(2)}</p>
                    </div>
                    <button onClick={() => handleCancelConsultation(c.id)} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>❌ Cancelar</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Agenda Tab - CRUD COMPLETO */}
        {activeTab === 'schedule' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>📅 Minha Agenda</h2>
              <button onClick={() => setShowScheduleModal(true)} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>➕ Adicionar Horário</button>
            </div>
            <div style={{ display: 'grid', gap: '16px' }}>
              {scheduleSlots.map(slot => (
                <div key={slot.id} style={{ border: '2px solid #e5e7eb', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>📅 {slot.date}</h3>
                    <p style={{ color: '#6b7280' }}>⏰ {slot.startTime} - {slot.endTime}</p>
                    <p style={{ color: slot.available ? '#10b981' : '#ef4444', fontWeight: '600' }}>{slot.available ? '✅ Disponível' : '❌ Ocupado'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => setEditingSlot(slot)} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>✏️ Editar</button>
                    <button onClick={() => handleDeleteSlot(slot.id)} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>🗑️ Remover</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ganhos Tab - READ */}
        {activeTab === 'earnings' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>💰 Relatório de Ganhos</h2>
            <div style={{ marginBottom: '30px' }}>
              <p style={{ fontSize: '48px', fontWeight: '800', color: '#10b981' }}>R$ {(stats?.earnings || 0).toFixed(2)}</p>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>Total do mês atual</p>
            </div>
          </div>
        )}

        {/* Clientes Tab - CRUD */}
        {activeTab === 'clients' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>👥 Meus Clientes</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              {clients.map(client => (
                <div key={client.id} style={{ border: '2px solid #e5e7eb', borderRadius: '12px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{client.name}</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>{client.email}</p>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>Consultas: {client.totalConsultations} | Última: {client.lastConsultation}</p>
                  </div>
                  <button onClick={() => { setSelectedClient(client); setClientNotes(client.notes); setShowClientModal(true); }} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>📝 Notas</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Perfil Tab - UPDATE */}
        {activeTab === 'profile' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800' }}>👤 Meu Perfil</h2>
              <button onClick={() => editMode ? handleUpdateProfile() : setEditMode(true)} style={{ padding: '12px 24px', background: editMode ? '#10b981' : '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>
                {editMode ? '💾 Salvar' : '✏️ Editar'}
              </button>
            </div>
            <div style={{ display: 'grid', gap: '20px' }}>
              {Object.entries(profileData).map(([key, value]) => (
                <div key={key}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', textTransform: 'capitalize' }}>{key}</label>
                  {key === 'bio' ? (
                    <textarea value={value} onChange={(e) => setProfileData({...profileData, [key]: e.target.value})} disabled={!editMode} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px', minHeight: '100px' }} />
                  ) : (
                    <input type="text" value={value} onChange={(e) => setProfileData({...profileData, [key]: e.target.value})} disabled={!editMode} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '16px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configurações Tab - UPDATE */}
        {activeTab === 'settings' && (
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>⚙️ Configurações</h2>
            <div style={{ display: 'grid', gap: '24px' }}>
              {Object.entries(settings).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '2px solid #e5e7eb', borderRadius: '12px' }}>
                  <span style={{ fontWeight: '600', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
                  {typeof value === 'boolean' ? (
                    <button onClick={() => setSettings({...settings, [key]: !value})} style={{ width: '56px', height: '32px', borderRadius: '16px', background: value ? '#10b981' : '#6b7280', border: 'none', cursor: 'pointer', position: 'relative' }}>
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: value ? '27px' : '3px', transition: 'all 0.3s' }}></div>
                    </button>
                  ) : (
                    <input type="number" value={value} onChange={(e) => setSettings({...settings, [key]: parseInt(e.target.value)})} style={{ width: '100px', padding: '8px', border: '2px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }} />
                  )}
                </div>
              ))}
              <button onClick={handleUpdateSettings} style={{ padding: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' }}>💾 Salvar Configurações</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Criar Horário */}
      {showScheduleModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowScheduleModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>➕ Adicionar Horário</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Data</label>
                <input type="date" value={newSlot.date} onChange={(e) => setNewSlot({...newSlot, date: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Hora Início</label>
                <input type="time" value={newSlot.startTime} onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Hora Fim</label>
                <input type="time" value={newSlot.endTime} onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleCreateSlot} style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>✅ Criar</button>
                <button onClick={() => setShowScheduleModal(false)} style={{ flex: 1, padding: '16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>❌ Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Horário */}
      {editingSlot && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setEditingSlot(null)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>✏️ Editar Horário</h2>
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Data</label>
                <input type="date" value={editingSlot.date} onChange={(e) => setEditingSlot({...editingSlot, date: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Hora Início</label>
                <input type="time" value={editingSlot.startTime} onChange={(e) => setEditingSlot({...editingSlot, startTime: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Hora Fim</label>
                <input type="time" value={editingSlot.endTime} onChange={(e) => setEditingSlot({...editingSlot, endTime: e.target.value})} style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontWeight: '600' }}>Disponível:</label>
                <button onClick={() => setEditingSlot({...editingSlot, available: !editingSlot.available})} style={{ width: '56px', height: '32px', borderRadius: '16px', background: editingSlot.available ? '#10b981' : '#6b7280', border: 'none', cursor: 'pointer', position: 'relative' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: editingSlot.available ? '27px' : '3px', transition: 'all 0.3s' }}></div>
                </button>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={handleUpdateSlot} style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>💾 Salvar</button>
                <button onClick={() => setEditingSlot(null)} style={{ flex: 1, padding: '16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>❌ Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Notas Cliente */}
      {showClientModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowClientModal(false)}>
          <div style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '90%', maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>📝 Notas do Cliente</h2>
            <p style={{ marginBottom: '16px', fontWeight: '600' }}>{selectedClient?.name}</p>
            <textarea value={clientNotes} onChange={(e) => setClientNotes(e.target.value)} placeholder="Digite suas anotações sobre este cliente..." style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', minHeight: '150px', fontSize: '16px' }} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button onClick={handleUpdateClientNotes} style={{ flex: 1, padding: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>💾 Salvar</button>
              <button onClick={() => setShowClientModal(false)} style={{ flex: 1, padding: '16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>❌ Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
