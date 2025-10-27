import { useState, useEffect } from 'react';

export default function ComprarCreditos() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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
      window.location.href = '/login';
    });
  }, []);

  const packages = [
    {
      id: 1,
      name: 'Básico',
      credits: 10,
      price: 10,
      description: 'Perfeito para começar',
      features: ['10 créditos', 'Válido por 30 dias', 'Suporte básico']
    },
    {
      id: 2,
      name: 'Popular',
      credits: 50,
      price: 45,
      description: 'Mais vendido',
      features: ['50 créditos', '10% de desconto', 'Válido por 60 dias', 'Suporte prioritário'],
      badge: 'MAIS VENDIDO',
      highlight: true
    },
    {
      id: 3,
      name: 'Premium',
      credits: 100,
      price: 85,
      description: 'Melhor custo-benefício',
      features: ['100 créditos', '15% de desconto', 'Válido por 90 dias', 'Suporte VIP']
    },
    {
      id: 4,
      name: 'VIP',
      credits: 250,
      price: 200,
      description: 'Máximo valor',
      features: ['250 créditos', '20% de desconto', 'Válido por 180 dias', 'Suporte VIP 24h', 'Bônus exclusivos']
    }
  ];

  const handlePurchase = async (pkg) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      alert('Você precisa estar logado!');
      window.location.href = '/login';
      return;
    }

    const confirmar = confirm(
      `💰 Comprar Pacote ${pkg.name}?\n\n` +
      `Créditos: R$ ${pkg.credits.toFixed(2)}\n` +
      `Valor: R$ ${pkg.price.toFixed(2)}\n\n` +
      `Os créditos serão adicionados imediatamente à sua conta.`
    );

    if (!confirmar) return;

    setProcessing(true);

    try {
      // Simulação de compra (em produção, integrar com Stripe)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Adicionar créditos
      const response = await fetch('/api/credits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: pkg.credits,
          reference: `package_${pkg.id}`
        })
      });

      if (response.ok) {
        alert(`✅ Compra realizada com sucesso!\n\nR$ ${pkg.credits.toFixed(2)} foram adicionados à sua conta.`);
        
        // Atualizar user
        const userResponse = await fetch('/api/auth/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const userData = await userResponse.json();
        setUser(userData.user || userData);
      } else {
        const error = await response.json();
        alert(`❌ Erro: ${error.error || 'Falha ao processar compra'}`);
      }
    } catch (err) {
      alert('❌ Erro ao processar compra. Tente novamente.');
      console.error(err);
    } finally {
      setProcessing(false);
    }
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

  const currentCredits = parseFloat(user?.credits) || 0;

  return (
    <div style={{minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '60px 20px'}}>
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
            💰 Comprar Créditos
          </h1>
          <p style={{fontSize: '22px', color: 'rgba(255,255,255,0.9)', marginBottom: '20px'}}>
            Escolha o melhor pacote para você
          </p>
          <div style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            padding: '16px 32px',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{color: 'white', fontSize: '20px', fontWeight: '600'}}>
              💳 Seu saldo atual: R$ {currentCredits.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Pacotes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '30px',
          marginBottom: '60px'
        }}>
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: pkg.highlight ? '0 20px 40px rgba(0,0,0,0.3)' : '0 10px 20px rgba(0,0,0,0.2)',
                transform: pkg.highlight ? 'scale(1.05)' : 'scale(1)',
                border: pkg.highlight ? '4px solid #fbbf24' : 'none',
                position: 'relative',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = pkg.highlight ? 'scale(1.08)' : 'scale(1.03)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = pkg.highlight ? 'scale(1.05)' : 'scale(1)';
              }}
            >
              {/* Badge */}
              {pkg.badge && (
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  right: '-35px',
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: 'white',
                  padding: '8px 40px',
                  fontSize: '12px',
                  fontWeight: '700',
                  transform: 'rotate(45deg)',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                }}>
                  {pkg.badge}
                </div>
              )}

              {/* Header do Pacote */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '40px 30px',
                textAlign: 'center'
              }}>
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  color: 'white',
                  marginBottom: '10px'
                }}>
                  {pkg.name}
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: '20px'
                }}>
                  {pkg.description}
                </p>
                <div style={{
                  fontSize: '48px',
                  fontWeight: '800',
                  color: 'white',
                  marginBottom: '5px'
                }}>
                  R$ {pkg.price}
                </div>
                <div style={{
                  fontSize: '18px',
                  color: 'rgba(255,255,255,0.8)'
                }}>
                  {pkg.credits} créditos
                </div>
              </div>

              {/* Conteúdo */}
              <div style={{padding: '30px'}}>
                <ul style={{listStyle: 'none', padding: 0, marginBottom: '30px'}}>
                  {pkg.features.map((feature, i) => (
                    <li key={i} style={{
                      padding: '12px 0',
                      borderBottom: i < pkg.features.length - 1 ? '1px solid #e5e7eb' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '15px',
                      color: '#374151'
                    }}>
                      <span style={{color: '#10b981', marginRight: '10px', fontSize: '20px'}}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePurchase(pkg)}
                  disabled={processing}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: '700',
                    cursor: processing ? 'not-allowed' : 'pointer',
                    opacity: processing ? 0.7 : 1,
                    transition: 'all 0.3s'
                  }}
                >
                  {processing ? '⏳ Processando...' : '🛒 Comprar Agora'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Benefícios */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: '40px',
            color: '#111827'
          }}>
            Por que comprar créditos?
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
          }}>
            {[
              { icon: '🔒', title: 'Segurança Total', desc: 'Pagamentos protegidos e criptografados' },
              { icon: '⚡', title: 'Ativação Instantânea', desc: 'Créditos disponíveis imediatamente' },
              { icon: '💎', title: 'Melhor Preço', desc: 'Descontos progressivos em pacotes maiores' },
              { icon: '🎁', title: 'Bônus Exclusivos', desc: 'Créditos extras nos pacotes premium' }
            ].map((benefit, i) => (
              <div key={i} style={{textAlign: 'center'}}>
                <div style={{fontSize: '48px', marginBottom: '15px'}}>{benefit.icon}</div>
                <h3 style={{fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '10px'}}>
                  {benefit.title}
                </h3>
                <p style={{fontSize: '15px', color: '#6b7280', lineHeight: '1.6'}}>
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
