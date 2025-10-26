import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 
  'postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function createPaymentsTable() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    console.log('🔧 Criando tabela payments...\n');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        currency TEXT DEFAULT 'BRL',
        status TEXT NOT NULL,
        method TEXT NOT NULL,
        transaction_id TEXT UNIQUE,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('✅ Tabela payments criada com sucesso!');

    // Criar índices para melhor performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
      CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
    `);

    console.log('✅ Índices criados com sucesso!');

    // Verificar estrutura
    const columnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'payments'
      ORDER BY ordinal_position;
    `);

    console.log('\n📄 Estrutura da tabela PAYMENTS:');
    for (const col of columnsResult.rows) {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
      console.log(`  - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
    }

    console.log('\n✅ Tabela payments pronta para uso!\n');

    await pool.end();

  } catch (error) {
    console.error('❌ Erro ao criar tabela payments:', error);
    process.exit(1);
  }
}

createPaymentsTable();

