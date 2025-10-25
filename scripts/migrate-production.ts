import { Pool } from '@neondatabase/serverless';
import { config } from 'dotenv';
import path from 'path';
import fs from 'fs/promises';

// Carrega variáveis de ambiente de produção
config({ path: '.env.production' });

const initMigration = async () => {
  console.log('🚀 Iniciando migração do banco de dados...');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });

  try {
    // Verifica conexão
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco de dados estabelecida');

    // Lê arquivo de schema
    const schemaPath = path.join(process.cwd(), 'scripts', 'init-db.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');

    // Executa queries do schema
    console.log('📦 Criando tabelas...');
    await pool.query(schema);
    console.log('✅ Schema criado com sucesso');

    // Insere dados iniciais se necessário
    console.log('🌱 Inserindo dados iniciais...');
    const seedQueries = [
      `INSERT INTO consultants (id, slug, name, title, specialty, description, price_per_minute, rating, review_count, status, image_url)
       VALUES ('consultant_1', 'maria-silva', 'Maria Silva', 'Especialista em Tarot', 'Tarot e Astrologia', 
              'Especialista em leitura de tarot com mais de 10 anos de experiência', 3.50, 4.9, 1250, 'online',
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face')
       ON CONFLICT (id) DO NOTHING`,
       
      `INSERT INTO consultants (id, slug, name, title, specialty, description, price_per_minute, rating, review_count, status, image_url)
       VALUES ('consultant_2', 'joao-santos', 'João Santos', 'Numerólogo', 'Numerologia',
              'Numerólogo experiente com foco em autoconhecimento', 2.80, 4.8, 980, 'online',
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face')
       ON CONFLICT (id) DO NOTHING`
    ];

    for (const query of seedQueries) {
      await pool.query(query);
    }
    console.log('✅ Dados iniciais inseridos com sucesso');

    console.log('🎉 Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await pool.end();
  }
};

initMigration().catch(console.error);