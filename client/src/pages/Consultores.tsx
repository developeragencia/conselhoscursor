import React from 'react';

export default function Consultores() {
  const [consultants, setConsultants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/consultants?limit=50')
      .then(r => r.json())
      .then(data => {
        setConsultants(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return React.createElement('div', { style: { padding: '100px', textAlign: 'center' } },
      React.createElement('h1', null, 'Carregando consultores...')
    );
  }

  return React.createElement('div', { style: { padding: '40px', maxWidth: '1400px', margin: '0 auto' } },
    React.createElement('h1', { style: { fontSize: '40px', marginBottom: '40px', textAlign: 'center' } }, 
      'Consultores (' + consultants.length + ')'
    ),
    React.createElement('div', { 
      style: { 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '30px' 
      } 
    },
      consultants.map(function(c) {
        return React.createElement('div', { 
          key: c.id,
          style: { 
            border: '2px solid #ddd', 
            borderRadius: '12px', 
            padding: '20px',
            background: 'white'
          }
        },
          React.createElement('img', { 
            src: c.imageUrl || 'https://ui-avatars.com/api/?name=' + c.name,
            alt: c.name,
            style: { width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px' }
          }),
          React.createElement('h2', { style: { fontSize: '24px', margin: '15px 0 5px' } }, c.name),
          React.createElement('p', { style: { color: '#666', fontSize: '16px' } }, c.title),
          React.createElement('p', { style: { fontSize: '20px', fontWeight: 'bold', color: '#7c3aed', margin: '10px 0' } }, 
            'R$ ' + c.pricePerMinute.toFixed(2) + '/min'
          ),
          React.createElement('p', { style: { fontSize: '16px' } }, 
            '⭐ ' + c.rating + ' (' + c.reviewCount + ' avaliações)'
          )
        );
      })
    )
  );
}

