export default function TestConsultores() {
  return (
    <div style={{padding: '50px', fontFamily: 'Arial'}}>
      <h1>TESTE - Esta página aparece?</h1>
      <p>Se você está vendo isso, o React está funcionando!</p>
      <button onClick={async () => {
        try {
          const res = await fetch('/api/consultants?limit=5');
          const data = await res.json();
          alert('API OK! Total: ' + (Array.isArray(data) ? data.length : 0));
          console.log('Dados:', data);
        } catch (err) {
          alert('Erro na API: ' + err);
        }
      }}>
        Testar API
      </button>
    </div>
  );
}

