import { useState, useEffect } from 'react';

interface Consultant {
  id: string;
  name: string;
  title: string;
  specialty: string;
  description: string;
  pricePerMinute: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  status: string;
}

export default function ConsultoresPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/consultants?limit=50')
      .then(res => res.json())
      .then(data => {
        setConsultants(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredConsultants = consultants.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.title && c.title.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #faf5ff, #fce7f3)'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{width: '64px', height: '64px', border: '4px solid #9333ea', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px'}}></div>
          <p style={{color: '#9333ea', fontWeight: '500', fontSize: '18px'}}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #fef2f2, #fed7aa)', padding: '16px'}}>
        <div style={{textAlign: 'center', maxWidth: '448px', background: 'white', padding: '32px', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'}}>
          <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '12px'}}>Erro</h2>
          <p style={{color: '#4b5563', marginBottom: '24px'}}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{padding: '12px 24px', background: '#dc2626', color: 'white', borderRadius: '8px', fontWeight: '600', border: 'none', cursor: 'pointer'}}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(to bottom right, #faf5ff, #fce7f3)', padding: '48px 0'}}>
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 16px'}}>
        <div style={{textAlign: 'center', marginBottom: '48px'}}>
          <h1 style={{fontSize: '48px', fontWeight: '800', color: '#581c87', marginBottom: '16px'}}>
            Nossos Consultores
          </h1>
          <p style={{fontSize: '20px', color: '#4b5563'}}>
            {consultants.length} especialistas disponíveis
          </p>
        </div>

        <div style={{background: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', marginBottom: '32px', maxWidth: '672px', margin: '0 auto 32px'}}>
          <input
            type="text"
            placeholder="🔍 Buscar consultor..."
            style={{width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', fontSize: '16px'}}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredConsultants.length === 0 && (
          <div style={{textAlign: 'center', color: '#6b7280', fontSize: '20px', marginTop: '64px'}}>
            Nenhum consultor encontrado.
          </div>
        )}

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '32px'}}>
          {filteredConsultants.map((consultant) => (
            <div
              key={consultant.id}
              style={{background: 'white', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', overflow: 'hidden', transition: 'box-shadow 0.3s'}}
            >
              <div style={{position: 'relative', height: '192px', width: '100%'}}>
                <img
                  src={consultant.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(consultant.name)}&background=random&color=fff&size=256`}
                  alt={consultant.name}
                  style={{width: '100%', height: '100%', objectFit: 'cover'}}
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(consultant.name)}&background=random&color=fff&size=256`;
                  }}
                />
                <div style={{position: 'absolute', top: '12px', right: '12px', padding: '4px 12px', borderRadius: '9999px', background: consultant.status === 'online' ? '#10b981' : consultant.status === 'busy' ? '#f59e0b' : '#6b7280', color: 'white', fontSize: '12px', fontWeight: '600'}}>
                  {consultant.status === 'online' ? '● Online' : consultant.status === 'busy' ? '● Ocupado' : '● Offline'}
                </div>
              </div>
              
              <div style={{padding: '24px'}}>
                <h2 style={{fontSize: '24px', fontWeight: 'bold', color: '#7c3aed', marginBottom: '4px'}}>{consultant.name}</h2>
                <h3 style={{fontSize: '14px', fontWeight: '500', color: '#6b7280', marginBottom: '12px'}}>{consultant.title}</h3>
                
                <div style={{display: 'flex', alignItems: 'center', marginBottom: '12px'}}>
                  <span style={{color: '#fbbf24', marginRight: '8px'}}>
                    {'⭐'.repeat(Math.floor(consultant.rating))}
                  </span>
                  <span style={{color: '#6b7280', fontSize: '14px'}}>
                    {consultant.rating.toFixed(1)} ({consultant.reviewCount})
                  </span>
                </div>
                
                <p style={{color: '#4b5563', fontSize: '14px', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
                  {consultant.description}
                </p>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #f3f4f6'}}>
                  <span style={{color: '#7c3aed', fontWeight: 'bold', fontSize: '18px'}}>
                    R$ {consultant.pricePerMinute.toFixed(2)}/min
                  </span>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <button 
                      onClick={() => window.location.href = `/chat/${consultant.id}`}
                      style={{padding: '8px', background: '#ede9fe', color: '#7c3aed', borderRadius: '9999px', border: 'none', cursor: 'pointer'}}
                      title="Chat"
                    >
                      💬
                    </button>
                    <button 
                      style={{padding: '8px', background: '#ede9fe', color: '#7c3aed', borderRadius: '9999px', border: 'none', cursor: 'pointer'}}
                      title="Ligar"
                    >
                      📞
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
