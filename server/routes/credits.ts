import { Router } from 'express';
import { Pool } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'conselhos_secret_2025';

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

export const createCreditsRouter = (db: Pool | null) => {
  const router = Router();

  // GET /api/credits/balance - Obter saldo de créditos
  router.get('/balance', authenticate, async (req: any, res) => {
    try {
      const user_id = req.user.userId;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(
        'SELECT credits FROM users WHERE id = $1',
        [user_id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ credits: parseFloat(result.rows[0].credits) });
    } catch (error) {
      console.error('Erro ao obter saldo:', error);
      res.status(500).json({ error: 'Erro ao obter saldo' });
    }
  });

  // GET /api/credits/transactions - Histórico de transações
  router.get('/transactions', authenticate, async (req: any, res) => {
    try {
      const user_id = req.user.userId;
      const { limit = '20', offset = '0' } = req.query;

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      const result = await db.query(`
        SELECT * FROM credits_transactions 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `, [user_id, parseInt(limit as string), parseInt(offset as string)]);

      res.json({
        transactions: result.rows,
        total: result.rowCount
      });
    } catch (error) {
      console.error('Erro ao obter transações:', error);
      res.status(500).json({ error: 'Erro ao obter transações' });
    }
  });

  // POST /api/credits/add - Adicionar créditos (pagamento)
  router.post('/add', authenticate, async (req: any, res) => {
    try {
      const user_id = req.user.userId;
      const { amount, payment_method, reference_id } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valor inválido' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Iniciar transação
      await db.query('BEGIN');

      try {
        // Obter saldo atual
        const userResult = await db.query(
          'SELECT credits FROM users WHERE id = $1',
          [user_id]
        );

        if (userResult.rows.length === 0) {
          throw new Error('Usuário não encontrado');
        }

        const currentBalance = parseFloat(userResult.rows[0].credits);
        const newBalance = currentBalance + parseFloat(amount);

        // Atualizar saldo
        await db.query(
          'UPDATE users SET credits = $1 WHERE id = $2',
          [newBalance, user_id]
        );

        // Registrar transação
        const transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.query(`
          INSERT INTO credits_transactions (
            id, user_id, type, amount, balance_after, reference_id, created_at
          ) VALUES ($1, $2, 'add', $3, $4, $5, NOW())
        `, [transaction_id, user_id, amount, newBalance, reference_id || `payment_${payment_method || 'manual'}`]);

        await db.query('COMMIT');

        res.json({
          message: 'Créditos adicionados com sucesso',
          amount: parseFloat(amount),
          new_balance: newBalance,
          transaction_id
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Erro ao adicionar créditos:', error);
      res.status(500).json({ error: 'Erro ao adicionar créditos' });
    }
  });

  // POST /api/credits/debit - Debitar créditos (uso em consulta)
  router.post('/debit', authenticate, async (req: any, res) => {
    try {
      const user_id = req.user.userId;
      const { amount, reference_id, description } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valor inválido' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Iniciar transação
      await db.query('BEGIN');

      try {
        // Obter saldo atual
        const userResult = await db.query(
          'SELECT credits FROM users WHERE id = $1 FOR UPDATE',
          [user_id]
        );

        if (userResult.rows.length === 0) {
          throw new Error('Usuário não encontrado');
        }

        const currentBalance = parseFloat(userResult.rows[0].credits);

        if (currentBalance < parseFloat(amount)) {
          await db.query('ROLLBACK');
          return res.status(400).json({ 
            error: 'Créditos insuficientes',
            current_balance: currentBalance,
            required: parseFloat(amount)
          });
        }

        const newBalance = currentBalance - parseFloat(amount);

        // Atualizar saldo
        await db.query(
          'UPDATE users SET credits = $1 WHERE id = $2',
          [newBalance, user_id]
        );

        // Registrar transação
        const transaction_id = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await db.query(`
          INSERT INTO credits_transactions (
            id, user_id, type, amount, balance_after, reference_id, created_at
          ) VALUES ($1, $2, 'debit', $3, $4, $5, NOW())
        `, [transaction_id, user_id, amount, newBalance, reference_id || description || 'debit']);

        await db.query('COMMIT');

        res.json({
          message: 'Créditos debitados com sucesso',
          amount: parseFloat(amount),
          new_balance: newBalance,
          transaction_id
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Erro ao debitar créditos:', error);
      res.status(500).json({ error: 'Erro ao debitar créditos' });
    }
  });

  // GET /api/credits/packages - Pacotes de créditos disponíveis
  router.get('/packages', (req, res) => {
    res.json([
      {
        id: 'pack_10',
        credits: 10,
        price: 10.00,
        bonus: 0,
        total_credits: 10,
        popular: false
      },
      {
        id: 'pack_30',
        credits: 30,
        price: 27.00,
        bonus: 3,
        total_credits: 33,
        popular: true,
        savings: '10%'
      },
      {
        id: 'pack_50',
        credits: 50,
        price: 40.00,
        bonus: 10,
        total_credits: 60,
        popular: false,
        savings: '20%'
      },
      {
        id: 'pack_100',
        credits: 100,
        price: 70.00,
        bonus: 30,
        total_credits: 130,
        popular: false,
        savings: '30%',
        best_value: true
      }
    ]);
  });

  // POST /api/credits/transfer - Transferir créditos (presente)
  router.post('/transfer', authenticate, async (req: any, res) => {
    try {
      const sender_id = req.user.userId;
      const { recipient_email, amount, message } = req.body;

      if (!recipient_email || !amount || amount <= 0) {
        return res.status(400).json({ error: 'Email e valor são obrigatórios' });
      }

      if (!db) {
        return res.status(503).json({ error: 'Banco de dados indisponível' });
      }

      // Iniciar transação
      await db.query('BEGIN');

      try {
        // Verificar destinatário
        const recipientResult = await db.query(
          'SELECT id, credits FROM users WHERE email = $1',
          [recipient_email.toLowerCase()]
        );

        if (recipientResult.rows.length === 0) {
          await db.query('ROLLBACK');
          return res.status(404).json({ error: 'Destinatário não encontrado' });
        }

        const recipient_id = recipientResult.rows[0].id;

        if (recipient_id === sender_id) {
          await db.query('ROLLBACK');
          return res.status(400).json({ error: 'Não é possível transferir para si mesmo' });
        }

        // Debitar do remetente
        const senderResult = await db.query(
          'SELECT credits FROM users WHERE id = $1 FOR UPDATE',
          [sender_id]
        );

        const senderBalance = parseFloat(senderResult.rows[0].credits);

        if (senderBalance < parseFloat(amount)) {
          await db.query('ROLLBACK');
          return res.status(400).json({ error: 'Créditos insuficientes' });
        }

        const newSenderBalance = senderBalance - parseFloat(amount);
        await db.query(
          'UPDATE users SET credits = $1 WHERE id = $2',
          [newSenderBalance, sender_id]
        );

        // Creditar ao destinatário
        const recipientBalance = parseFloat(recipientResult.rows[0].credits);
        const newRecipientBalance = recipientBalance + parseFloat(amount);
        await db.query(
          'UPDATE users SET credits = $1 WHERE id = $2',
          [newRecipientBalance, recipient_id]
        );

        // Registrar transações
        const transfer_id = `transfer_${Date.now()}`;
        
        await db.query(`
          INSERT INTO credits_transactions (
            id, user_id, type, amount, balance_after, reference_id, created_at
          ) VALUES ($1, $2, 'debit', $3, $4, $5, NOW())
        `, [`txn_send_${transfer_id}`, sender_id, amount, newSenderBalance, `transfer_to_${recipient_id}`]);

        await db.query(`
          INSERT INTO credits_transactions (
            id, user_id, type, amount, balance_after, reference_id, created_at
          ) VALUES ($1, $2, 'add', $3, $4, $5, NOW())
        `, [`txn_receive_${transfer_id}`, recipient_id, amount, newRecipientBalance, `transfer_from_${sender_id}`]);

        await db.query('COMMIT');

        res.json({
          message: 'Créditos transferidos com sucesso',
          amount: parseFloat(amount),
          sender_new_balance: newSenderBalance,
          transfer_id
        });
      } catch (error) {
        await db.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Erro ao transferir créditos:', error);
      res.status(500).json({ error: 'Erro ao transferir créditos' });
    }
  });

  return router;
};

