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
    return <div style={{padding: '50px', textAlign: 'center'}}>Carregando...</div>;
  }

  return (
    <div style={{padding: '20px', maxWidth: '1200px', margin: '0 auto'}}>
      <h1>Consultores ({consultants.length})</h1>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '30px'}}>
        {consultants.map((c) => (
          <div key={c.id} style={{border: '1px solid #ddd', borderRadius: '8px', padding: '15px'}}>
            <img 
              src={c.imageUrl || `https://ui-avatars.com/api/?name=${c.name}`} 
              alt={c.name}
              style={{width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px'}}
            />
            <h2 style={{fontSize: '20px', margin: '10px 0'}}>{c.name}</h2>
            <p style={{color: '#666', fontSize: '14px'}}>{c.title}</p>
            <p style={{fontSize: '16px', fontWeight: 'bold', color: '#7c3aed'}}>
              R$ {c.pricePerMinute.toFixed(2)}/min
            </p>
            <p style={{fontSize: '14px'}}>⭐ {c.rating} ({c.reviewCount} avaliações)</p>
          </div>
        ))}
      </div>
      
      {consultants.length === 0 && (
        <p style={{textAlign: 'center', padding: '50px'}}>Nenhum consultor encontrado</p>
      )}
    </div>
  );
}
