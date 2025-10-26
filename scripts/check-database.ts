import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 
  'postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function checkDatabase() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    console.log('🔍 Verificando conexão com o banco de dados...\n');

    // Testar conexão
    const testResult = await pool.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida com sucesso!');
    console.log(`⏰ Timestamp do servidor: ${testResult.rows[0].now}\n`);

    // Listar todas as tabelas
    console.log('📊 Tabelas no banco de dados:\n');
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(`Total de tabelas: ${tablesResult.rows.length}\n`);
    
    for (const row of tablesResult.rows) {
      console.log(`  ✓ ${row.table_name}`);
    }

    console.log('\n📋 Detalhes de cada tabela:\n');

    // Verificar estrutura de cada tabela
    for (const table of tablesResult.rows) {
      const tableName = table.table_name;
      
      // Contar registros
      const countResult = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
      const count = countResult.rows[0].count;

      // Listar colunas
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `, [tableName]);

      console.log(`\n📄 ${tableName.toUpperCase()}`);
      console.log(`   Registros: ${count}`);
      console.log('   Colunas:');
      
      for (const col of columnsResult.rows) {
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
        console.log(`     - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
      }
    }

    console.log('\n\n✅ Verificação completa!\n');

    // Verificar tabelas esperadas
    const expectedTables = [
      'users',
      'consultants',
      'testimonials',
      'credits_transactions',
      'consultations',
      'messages',
      'blog_posts',
      'blog_categories',
      'blog_comments',
      'notifications',
      'payments'
    ];

    console.log('🔎 Verificando tabelas esperadas:\n');
    
    const existingTables = tablesResult.rows.map(r => r.table_name);
    
    for (const expectedTable of expectedTables) {
      if (existingTables.includes(expectedTable)) {
        console.log(`  ✅ ${expectedTable} - OK`);
      } else {
        console.log(`  ❌ ${expectedTable} - FALTANDO`);
      }
    }

    await pool.end();

  } catch (error) {
    console.error('❌ Erro ao verificar banco de dados:', error);
    process.exit(1);
  }
}

checkDatabase();

