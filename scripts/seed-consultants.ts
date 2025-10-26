import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import 'dotenv/config';

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL ou NEON_DATABASE_URL não está configurado');
  process.exit(1);
}

const pool = new Pool({ connectionString });

const consultores = [
  {
    name: 'Maria das Estrelas',
    slug: 'maria-das-estrelas',
    title: 'Especialista em Tarot e Astrologia',
    specialty: 'Tarot',
    description: 'Com mais de 15 anos de experiência em leitura de tarot e mapas astrais, ajudo pessoas a encontrarem clareza em momentos de dúvida. Minha abordagem combina intuição espiritual com conhecimento astrológico profundo.',
    price_per_minute: 5.50,
    rating: 4.9,
    review_count: 287,
    status: 'online',
    image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
  },
  {
    name: 'Carlos Magno',
    slug: 'carlos-magno',
    title: 'Mestre em Numerologia',
    specialty: 'Numerologia',
    description: 'Numerólogo certificado com expertise em decodificar os números da sua vida. Descubra seu propósito através da numerologia pitagórica e cabalística. Mais de 10 anos transformando vidas.',
    price_per_minute: 4.80,
    rating: 4.8,
    review_count: 195,
    status: 'online',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'
  },
  {
    name: 'Ana Luz',
    slug: 'ana-luz',
    title: 'Medium e Terapeuta Holística',
    specialty: 'Mediunidade',
    description: 'Medium desde criança, ofereço conexões espirituais profundas e mensagens de orientação. Trabalho também com terapia holística, Reiki e limpeza energética. Venha encontrar paz e respostas.',
    price_per_minute: 6.00,
    rating: 5.0,
    review_count: 342,
    status: 'online',
    image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'
  },
  {
    name: 'Pedro Celestial',
    slug: 'pedro-celestial',
    title: 'Astrólogo e Coach Espiritual',
    specialty: 'Astrologia',
    description: 'Astrólogo profissional especializado em mapas natais, trânsitos planetários e previsões astrológicas. Ajudo você a compreender os ciclos da sua vida e tomar decisões alinhadas com o cosmos.',
    price_per_minute: 5.20,
    rating: 4.7,
    review_count: 156,
    status: 'online',
    image_url: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400'
  },
  {
    name: 'Juliana Mystic',
    slug: 'juliana-mystic',
    title: 'Tarotista e Oraculista',
    specialty: 'Tarot',
    description: 'Especialista em Tarot Rider-Waite, Tarot de Marselha e Oráculo dos Anjos. Com sensibilidade e empatia, trago clareza sobre amor, carreira e propósito de vida. Mais de 8 anos guiando almas.',
    price_per_minute: 4.50,
    rating: 4.9,
    review_count: 223,
    status: 'online',
    image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400'
  },
  {
    name: 'Roberto Oráculo',
    slug: 'roberto-oraculo',
    title: 'Especialista em Runas e Oráculos',
    specialty: 'Runas',
    description: 'Mestre em runas nórdicas e oráculos ancestrais. Trabalho com sabedoria viking para revelar caminhos e soluções. Consultas profundas sobre decisões importantes e momentos de transição.',
    price_per_minute: 5.80,
    rating: 4.8,
    review_count: 178,
    status: 'online',
    image_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400'
  }
];

async function seedConsultants() {
  try {
    console.log('🌱 Iniciando seed de consultores...\n');

    // Verificar quantos consultores já existem
    const checkResult = await pool.query('SELECT COUNT(*) FROM consultants');
    const existingCount = parseInt(checkResult.rows[0].count);
    
    console.log(`📊 Consultores existentes no banco: ${existingCount}\n`);

    if (existingCount > 0) {
      console.log('⚠️  Já existem consultores no banco.');
      console.log('🔄 Deseja sobrescrever? (Ctrl+C para cancelar)\n');
      
      // Aguardar 3 segundos
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Deletar consultores existentes
      await pool.query('DELETE FROM consultants');
      console.log('🗑️  Consultores antigos removidos.\n');
    }

    // Inserir novos consultores
    for (const consultor of consultores) {
      const id = `consultant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await pool.query(`
        INSERT INTO consultants (
          id, slug, name, title, specialty, description, 
          price_per_minute, rating, review_count, status, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        id,
        consultor.slug,
        consultor.name,
        consultor.title,
        consultor.specialty,
        consultor.description,
        consultor.price_per_minute,
        consultor.rating,
        consultor.review_count,
        consultor.status,
        consultor.image_url
      ]);

      console.log(`✅ ${consultor.name} - ${consultor.specialty}`);
      
      // Pequeno delay para evitar conflitos
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n🎉 ${consultores.length} consultores inseridos com sucesso!`);
    
    // Verificar resultado final
    const finalResult = await pool.query('SELECT COUNT(*) FROM consultants');
    console.log(`\n📊 Total de consultores no banco: ${finalResult.rows[0].count}`);
    
    // Mostrar alguns consultores
    const sampleResult = await pool.query('SELECT name, specialty, status, rating FROM consultants LIMIT 3');
    console.log('\n👥 Amostra de consultores:');
    sampleResult.rows.forEach(c => {
      console.log(`   - ${c.name} (${c.specialty}) - ${c.status} - ⭐ ${c.rating}`);
    });

  } catch (error) {
    console.error('\n❌ Erro ao fazer seed:', error);
  } finally {
    await pool.end();
    console.log('\n✅ Conexão com banco encerrada.');
  }
}

seedConsultants();

