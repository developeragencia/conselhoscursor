import { Pool } from '@neondatabase/serverless';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.NEON_DATABASE_URL
});

const consultoresExemplo = [
  {
    name: 'Maria Silva',
    slug: 'maria-silva',
    title: 'Tarot e Astrologia',
    specialty: 'tarot',
    description: 'Especialista em Tarot com mais de 15 anos de experiência. Realizo leituras profundas para orientação em todos os aspectos da vida.',
    price_per_minute: 3.50,
    rating: 4.9,
    review_count: 234,
    image_url: 'https://i.pravatar.cc/300?img=47',
    whatsapp: '+5511999999001',
    status: 'online',
    is_active: true
  },
  {
    name: 'João Santos',
    slug: 'joao-santos',
    title: 'Mestre em Astrologia',
    specialty: 'astrologia',
    description: 'Astrólogo profissional especializado em mapas astrais personalizados e previsões astrológicas precisas.',
    price_per_minute: 4.00,
    rating: 4.8,
    review_count: 189,
    image_url: 'https://i.pravatar.cc/300?img=12',
    whatsapp: '+5511999999002',
    status: 'online',
    is_active: true
  },
  {
    name: 'Ana Costa',
    slug: 'ana-costa',
    title: 'Numerologia e Tarot',
    specialty: 'numerologia',
    description: 'Numeróloga experiente que ajuda você a descobrir os números que regem sua vida e destino.',
    price_per_minute: 3.00,
    rating: 4.7,
    review_count: 156,
    image_url: 'https://i.pravatar.cc/300?img=32',
    whatsapp: '+5511999999003',
    status: 'online',
    is_active: true
  },
  {
    name: 'Pedro Oliveira',
    slug: 'pedro-oliveira',
    title: 'Tarot Cigano',
    specialty: 'tarot',
    description: 'Especialista em Tarot Cigano e Baralho Espanhol. Consultas detalhadas sobre amor, trabalho e vida pessoal.',
    price_per_minute: 3.25,
    rating: 4.9,
    review_count: 198,
    image_url: 'https://i.pravatar.cc/300?img=15',
    whatsapp: '+5511999999004',
    status: 'online',
    is_active: true
  },
  {
    name: 'Carla Mendes',
    slug: 'carla-mendes',
    title: 'Médium e Tarot',
    specialty: 'mediunidade',
    description: 'Médium intuitiva com conexões espirituais profundas. Ajudo você a encontrar respostas através do mundo espiritual.',
    price_per_minute: 4.50,
    rating: 5.0,
    review_count: 267,
    image_url: 'https://i.pravatar.cc/300?img=44',
    whatsapp: '+5511999999005',
    status: 'online',
    is_active: true
  },
  {
    name: 'Rafael Souza',
    slug: 'rafael-souza',
    title: 'Runas Nórdicas',
    specialty: 'runas',
    description: 'Especialista em Runas Nórdicas e simbolismo ancestral. Ofereco orientação espiritual através da sabedoria antiga.',
    price_per_minute: 3.75,
    rating: 4.8,
    review_count: 145,
    image_url: 'https://i.pravatar.cc/300?img=18',
    whatsapp: '+5511999999006',
    status: 'online',
    is_active: true
  }
];

async function popularConsultores() {
  try {
    console.log('🔍 Verificando consultores existentes...');
    
    const check = await pool.query('SELECT COUNT(*) as count FROM consultants');
    const count = parseInt(check.rows[0].count);
    
    console.log(`📊 Consultores encontrados: ${count}`);
    
    if (count > 0) {
      console.log('✅ Já existem consultores cadastrados!');
      console.log('💡 Se quiser adicionar mais consultores, delete os existentes primeiro.');
      return;
    }
    
    console.log('📝 Populando banco de dados com consultores de exemplo...');
    
    for (const consultor of consultoresExemplo) {
      await pool.query(`
        INSERT INTO consultants (
          name, slug, title, specialty, description, 
          price_per_minute, rating, review_count, image_url, 
          whatsapp, status, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (slug) DO NOTHING
      `, [
        consultor.name,
        consultor.slug,
        consultor.title,
        consultor.specialty,
        consultor.description,
        consultor.price_per_minute,
        consultor.rating,
        consultor.review_count,
        consultor.image_url,
        consultor.whatsapp,
        consultor.status,
        consultor.is_active
      ]);
      
      console.log(`✅ Consultor adicionado: ${consultor.name}`);
    }
    
    console.log('\n🎉 Consultores populados com sucesso!');
    console.log(`📊 Total de consultores: ${consultoresExemplo.length}`);
    
  } catch (error) {
    console.error('❌ Erro ao popular consultores:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

popularConsultores();

