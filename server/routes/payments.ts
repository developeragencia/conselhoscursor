import { Router } from 'express';
import { Pool } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';

const JWT_SECRET = process.env.JWT_SECRET || 'conselhos_secret_2025';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

// Inicializar Stripe apenas se a chave estiver configurada
let stripe: Stripe | null = null;
if (STRIPE_SECRET_KEY && STRIPE_SECRET_KEY.startsWith('sk_')) {
  stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-10-28.acacia'
  });
  console.log('✅ Stripe initialized');
} else {
  console.log('⚠️  Stripe not configured (STRIPE_SECRET_KEY missing)');
}

// Middleware de autenticação
const authenticate = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const createPaymentsRouter = (db: Pool | null) => {
  const router = Router();

  // Aplicar autenticação em todas as rotas
  router.use(authenticate);

  // GET /api/payments/config - Obter chave pública do Stripe
  router.get('/config', (req, res) => {
    res.json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      configured: !!stripe
    });
  });

  // POST /api/payments/create-payment-intent - Criar intenção de pagamento
  router.post('/create-payment-intent', authenticate, async (req: any, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ 
          error: 'Stripe não configurado. Configure STRIPE_SECRET_KEY.' 
        });
      }

      const { amount, package_id } = req.body;
      const user_id = req.user.userId;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valor inválido' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Buscar informações do usuário
      const userResult = await db.query(
        'SELECT email, first_name, last_name FROM users WHERE id = $1',
        [user_id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const user = userResult.rows[0];

      // Criar Payment Intent no Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe usa centavos
        currency: 'brl',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          user_id,
          package_id: package_id || 'custom',
          email: user.email,
          name: `${user.first_name} ${user.last_name}`
        },
        description: `Recarga de créditos - Conselhos Esotéricos`
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error('Erro ao criar payment intent:', error);
      res.status(500).json({ error: 'Erro ao processar pagamento' });
    }
  });

  // POST /api/payments/webhook - Webhook do Stripe
  router.post('/webhook', async (req, res) => {
    if (!stripe) {
      return res.status(503).json({ error: 'Stripe não configurado' });
    }

    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET não configurado');
      return res.status(400).json({ error: 'Webhook não configurado' });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Erro na verificação do webhook:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Processar evento
    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        default:
          console.log(`Evento não tratado: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      res.status(500).json({ error: 'Erro ao processar evento' });
    }
  });

  // Função para processar pagamento bem-sucedido
  const handlePaymentSuccess = async (paymentIntent: Stripe.PaymentIntent) => {
    if (!db) return;

    const { user_id, package_id } = paymentIntent.metadata;
    const amount = paymentIntent.amount / 100; // Converter de centavos para reais

    try {
      await db.query('BEGIN');

      // Obter saldo atual
      const userResult = await db.query(
        'SELECT credits FROM users WHERE id = $1 FOR UPDATE',
        [user_id]
      );

      if (userResult.rows.length === 0) {
        await db.query('ROLLBACK');
        console.error('Usuário não encontrado:', user_id);
        return;
      }

      const currentBalance = parseFloat(userResult.rows[0].credits);
      const newBalance = currentBalance + amount;

      // Atualizar saldo
      await db.query(
        'UPDATE users SET credits = $1 WHERE id = $2',
        [newBalance, user_id]
      );

      // Registrar transação
      const transaction_id = `txn_stripe_${Date.now()}`;
      await db.query(`
        INSERT INTO credits_transactions (
          id, user_id, type, amount, balance_after, reference_id, created_at
        ) VALUES ($1, $2, 'add', $3, $4, $5, NOW())
      `, [transaction_id, user_id, amount, newBalance, paymentIntent.id]);

      await db.query('COMMIT');

      console.log(`✅ Pagamento processado: R$ ${amount} para usuário ${user_id}`);

      // TODO: Enviar notificação para o usuário
    } catch (error) {
      await db.query('ROLLBACK');
      console.error('Erro ao processar pagamento:', error);
    }
  };

  // Função para processar falha de pagamento
  const handlePaymentFailed = async (paymentIntent: Stripe.PaymentIntent) => {
    const { user_id } = paymentIntent.metadata;
    console.error(`❌ Pagamento falhou para usuário ${user_id}:`, paymentIntent.last_payment_error?.message);
    
    // TODO: Enviar notificação de falha para o usuário
  };

  // GET /api/payments/history - Histórico de pagamentos
  router.get('/history', authenticate, async (req: any, res) => {
    try {
      const user_id = req.user.userId;
      const { limit = '20', offset = '0' } = req.query;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(`
        SELECT * FROM credits_transactions 
        WHERE user_id = $1 AND type = 'add' AND reference_id LIKE 'pi_%'
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `, [user_id, parseInt(limit as string), parseInt(offset as string)]);

      res.json({
        payments: result.rows,
        total: result.rowCount
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  });

  // POST /api/payments/pix/create - Criar pagamento PIX (Mercado Pago)
  router.post('/pix/create', authenticate, async (req: any, res) => {
    try {
      const { amount, package_id } = req.body;
      const user_id = req.user.userId;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valor inválido' });
      }

      // TODO: Implementar integração com Mercado Pago para PIX
      // Por enquanto, retornar estrutura simulada
      
      const payment_id = `pix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const qr_code = `00020126580014BR.GOV.BCB.PIX0136${payment_id}520400005303986540${amount.toFixed(2)}5802BR5925Conselhos Esotericos6009SAO PAULO`;
      
      res.json({
        payment_id,
        qr_code,
        qr_code_base64: Buffer.from(qr_code).toString('base64'),
        amount,
        expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
        status: 'pending'
      });
    } catch (error) {
      console.error('Erro ao criar PIX:', error);
      res.status(500).json({ error: 'Erro ao criar pagamento PIX' });
    }
  });

  // GET /api/payments/pix/:id/status - Verificar status do PIX
  router.get('/pix/:id/status', authenticate, async (req: any, res) => {
    try {
      const { id } = req.params;

      // TODO: Implementar verificação real com Mercado Pago
      // Por enquanto, retornar status simulado
      
      res.json({
        payment_id: id,
        status: 'pending', // pending, approved, rejected
        amount: 0,
        paid_at: null
      });
    } catch (error) {
      console.error('Erro ao verificar PIX:', error);
      res.status(500).json({ error: 'Erro ao verificar status' });
    }
  });

  // GET /api/payments/methods - Métodos de pagamento disponíveis
  router.get('/methods', (req, res) => {
    res.json({
      methods: [
        {
          id: 'credit_card',
          name: 'Cartão de Crédito',
          enabled: !!stripe,
          provider: 'stripe',
          icon: '💳'
        },
        {
          id: 'pix',
          name: 'PIX',
          enabled: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
          provider: 'mercadopago',
          icon: '🇧🇷',
          instant: true
        }
      ]
    });
  });

  return router;
};

