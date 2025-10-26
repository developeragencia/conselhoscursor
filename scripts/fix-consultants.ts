import { Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';

neonConfig.webSocketConstructor = ws;

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || 
  'postgresql://neondb_owner:npg_ksSvMNnFX9m5@ep-dry-moon-a41gklbl-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const db = new Pool({
  connectionString: DATABASE_URL
});

interface ConsultantData {
  slug: string;
  name: string;
  title: string;
  specialty: string;
  description: string;
  price_per_minute: number;
  rating: number;
  review_count: number;
  status: string;
  image_url: string;
}

const consultants: ConsultantData[] = [
  {
    slug: 'fabianna-tarot',
    name: 'Fabianna',
    title: 'Taróloga e Vidente',
    specialty: 'Tarot',
    description: 'Especialista em Tarot com mais de 10 anos de experiência. Orientação espiritual para amor, carreira e finanças com sensibilidade e clareza.',
    price_per_minute: 3.50,
    rating: 4.9,
    review_count: 127,
    status: 'online',
    image_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=400&h=400&fit=crop&crop=face'
  },
  {
    slug: 'annafreya-cartomancia',
    name: 'AnnaFreya',
    title: 'Cartomante Profissional',
    specialty: 'Cartomancia',
    description: 'Cartomante experiente com dom natural para vidência. Consultas precisas sobre amor, trabalho e vida espiritual.',
    price_per_minute: 4.00,
    rating: 4.8,
    review_count: 98,
    status: 'online',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face'
  },
  {
    slug: 'mistica-numerologia',
    name: 'Mística Luna',
    title: 'Numeróloga e Astró loga',
    specialty: 'Numerologia',
    description: 'Especialista em numerologia e mapa astral. Descubra seu propósito através dos números e astros.',
    price_per_minute: 3.80,
    rating: 4.7,
    review_count: 85,
    status: 'online',
    image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face'
  },
  {
    slug: 'atena-vidente',
    name: 'Atena Mystic',
    title: 'Vidente e Medium',
    specialty: 'Mediunidade',
    description: 'Medium com mais de 15 anos de experiência. Conexão espiritual profunda para orientação e cura.',
    price_per_minute: 5.00,
    rating: 4.9,
    review_count: 156,
    status: 'busy',
    image_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face'
  },
  {
    slug: 'rafael-astrologo',
    name: 'Rafael Astral',
    title: 'Astrólogo e Tarólogo',
    specialty: 'Astrologia',
    description: 'Astrólogo profissional com formação internacional. Mapa astral completo e previsões precisas.',
    price_per_minute: 4.50,
    rating: 4.8,
    review_count: 112,
    status: 'online',
    image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
  },
  {
    slug: 'gabriela-reiki',
    name: 'Gabriela Luz',
    title: 'Terapeuta Holística',
    specialty: 'Terapias',
    description: 'Mestre Reiki e terapeuta holística. Cura energética, harmonização de chakras e orientação espiritual.',
    price_per_minute: 4.20,
    rating: 4.9,
    review_count: 143,
    status: 'online',
    image_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face'
  }
];

async function populateConsultants() {
  console.log('🌟 Populando consultores...\n');

  try {
    // Limpar consultores existentes
    await db.query('DELETE FROM consultants');
    console.log('✅ Consultores anteriores removidos\n');

    // Inserir novos consultores
    for (const consultant of consultants) {
      const id = `consultant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await db.query(`
        INSERT INTO consultants (
          id, slug, name, title, specialty, description,
          price_per_minute, rating, review_count, status, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        id,
        consultant.slug,
        consultant.name,
        consultant.title,
        consultant.specialty,
        consultant.description,
        consultant.price_per_minute,
        consultant.rating,
        consultant.review_count,
        consultant.status,
        consultant.image_url
      ]);

      console.log(`✅ ${consultant.name} - ${consultant.specialty} - ${consultant.status}`);
    }

    console.log(`\n🎉 ${consultants.length} consultores populados com sucesso!`);

    // Verificar resultado
    const result = await db.query('SELECT name, specialty, status, image_url FROM consultants');
    console.log('\n📊 Consultores no banco:');
    result.rows.forEach((row: any) => {
      console.log(`  ✓ ${row.name} - ${row.specialty} - ${row.status} - Imagem: ${row.image_url ? '✅' : '❌'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao popular consultores:', error);
  } finally {
    await db.end();
  }
}

populateConsultants();

