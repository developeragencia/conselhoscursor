export default function Consultores() {
  const [consultants, setConsultants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    fetch('/api/consultants?limit=50')
      .then(res => res.json())
      .then(data => {
        setConsultants(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filtered = consultants.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{padding: '100px', textAlign: 'center', fontFamily: 'Arial'}}>
        <h1>Carregando consultores...</h1>
      </div>
    );
  }

  return (
    <div style={{padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Arial'}}>
      <h1 style={{textAlign: 'center', fontSize: '40px', marginBottom: '20px'}}>
        Consultores ({consultants.length})
      </h1>
      
      <div style={{marginBottom: '30px', textAlign: 'center'}}>
        <input
          type="text"
          placeholder="Buscar consultor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            width: '400px',
            maxWidth: '90%',
            border: '2px solid #ddd',
            borderRadius: '8px'
          }}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '30px'
      }}>
        {filtered.map((c) => (
          <div key={c.id} style={{
            border: '2px solid #ddd',
            borderRadius: '12px',
            padding: '20px',
            background: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <img
              src={c.imageUrl || `https://ui-avatars.com/api/?name=${c.name}`}
              alt={c.name}
              style={{
                width: '100%',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '15px'
              }}
            />
            <h2 style={{fontSize: '24px', margin: '10px 0', color: '#333'}}>{c.name}</h2>
            <p style={{color: '#666', fontSize: '16px', marginBottom: '10px'}}>{c.title}</p>
            <p style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#7c3aed',
              margin: '10px 0'
            }}>
              R$ {c.pricePerMinute ? c.pricePerMinute.toFixed(2) : '0.00'}/min
            </p>
            <p style={{fontSize: '16px', color: '#666'}}>
              ⭐ {c.rating ? c.rating.toFixed(1) : '0'} ({c.reviewCount || 0} avaliações)
            </p>
            <div style={{
              marginTop: '15px',
              padding: '8px',
              background: c.status === 'online' ? '#10b981' : '#6b7280',
              color: 'white',
              borderRadius: '6px',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              {c.status === 'online' ? '🟢 Online' : '⚫ Offline'}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{textAlign: 'center', fontSize: '20px', color: '#666', marginTop: '50px'}}>
          Nenhum consultor encontrado
        </p>
      )}
    </div>
  );
}

// Necessário para TypeScript/React
const React = (window as any).React || require('react');
