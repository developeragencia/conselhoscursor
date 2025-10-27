import { useState, useEffect } from 'react';

export default function Consultores() {
  const [consultants, setConsultants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/consultants?limit=50')
      .then(res => res.json())
      .then(data => {
        setConsultants(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{padding: '50px', textAlign: 'center', fontSize: '24px'}}>Carregando...</div>;
  }

  return (
    <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto', background: '#f9fafb', minHeight: '100vh'}}>
      <h1 style={{fontSize: '40px', textAlign: 'center', marginBottom: '40px', color: '#7c3aed'}}>
        Consultores ({consultants.length})
      </h1>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px'}}>
        {consultants.map((c) => {
          const price = parseFloat(c.pricePerMinute) || 0;
          const rating = parseFloat(c.rating) || 0;
          
          return (
            <div key={c.id} style={{border: '1px solid #e5e7eb', borderRadius: '12px', padding: '15px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
              <img 
                src={c.imageUrl || `https://ui-avatars.com/api/?name=${c.name}`} 
                alt={c.name}
                style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px'}}
              />
              <h2 style={{fontSize: '22px', margin: '0 0 8px', color: '#111827'}}>{c.name}</h2>
              <p style={{color: '#6b7280', fontSize: '14px', margin: '0 0 12px'}}>{c.title}</p>
              <p style={{fontSize: '18px', fontWeight: 'bold', color: '#7c3aed', margin: '0 0 8px'}}>
                R$ {price.toFixed(2)}/min
              </p>
              <p style={{fontSize: '14px', color: '#6b7280', margin: 0}}>
                ⭐ {rating.toFixed(1)} ({c.reviewCount || 0} avaliações)
              </p>
            </div>
          );
        })}
      </div>
      
      {consultants.length === 0 && (
        <p style={{textAlign: 'center', padding: '50px', fontSize: '20px', color: '#6b7280'}}>
          Nenhum consultor encontrado
        </p>
      )}
    </div>
  );
}
