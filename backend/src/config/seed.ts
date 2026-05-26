import pool from './database';
import dotenv from 'dotenv';

dotenv.config();

const seedProducts = async (): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get category IDs
    const catResult = await client.query('SELECT id, slug FROM categories');
    const cats: Record<string, number> = {};
    catResult.rows.forEach((r: { id: number; slug: string }) => {
      cats[r.slug] = r.id;
    });

    const products = [
      {
        name: 'Alphonso Mango',
        description: 'The king of mangoes — rich, creamy, and intensely sweet. Sourced from Rajshahi orchards at peak ripeness.',
        price_per_kg: 350,
        season: 'summer',
        category_id: cats['tropical'],
        stock_kg: 120,
        image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80',
        is_available: true,
      },
      {
        name: 'Jackfruit',
        description: 'Enormous tropical fruit with a sweet, distinctive flavour. Great eaten fresh or used in cooking.',
        price_per_kg: 80,
        season: 'summer',
        category_id: cats['tropical'],
        stock_kg: 200,
        image_url: 'https://images.unsplash.com/photo-1530699027919-ea1a0a3d48ae?w=800&q=80',
        is_available: true,
      },
      {
        name: 'Lychee',
        description: 'Fragrant, juicy lychees from Dinajpur — floral sweetness with a slight tartness.',
        price_per_kg: 280,
        season: 'summer',
        category_id: cats['tropical'],
        stock_kg: 60,
        image_url: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?w=800&q=80',
        is_available: true,
      },
      {
        name: 'Watermelon',
        description: 'Crisp and refreshingly sweet. Perfect for hot summer days. Seedless variety available.',
        price_per_kg: 45,
        season: 'summer',
        category_id: cats['melons'],
        stock_kg: 350,
        image_url: 'https://images.unsplash.com/photo-1563114773-84221bd62daa?w=800&q=80',
        is_available: true,
      },
      {
        name: 'Banana (Sagor)',
        description: 'Small, sweet Sagor bananas — a Bangladeshi favourite. Perfect ripeness, naturally grown.',
        price_per_kg: 60,
        season: 'year-round',
        category_id: cats['tropical'],
        stock_kg: 500,
        image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80',
        is_available: true,
      },
      {
        name: 'Pineapple',
        description: 'Golden, tangy-sweet pineapples from the hill tracts. Juicy with a bold tropical flavour.',
        price_per_kg: 120,
        season: 'year-round',
        category_id: cats['tropical'],
        stock_kg: 180,
        image_url: 'https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=800&q=80',
        is_available: true,
      },
      {
        name: 'Guava (Peyara)',
        description: 'Crispy, fragrant guavas. Eaten raw or with a pinch of salt and chili — a street food classic.',
        price_per_kg: 90,
        season: 'winter',
        category_id: cats['tropical'],
        stock_kg: 150,
        image_url: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?w=800&q=80',
        is_available: true,
      },
      {
        name: 'Malta Orange',
        description: 'Juicy Bangladeshi Malta oranges — thin skinned, easy to peel, brilliantly sweet-tart.',
        price_per_kg: 160,
        season: 'winter',
        category_id: cats['citrus'],
        stock_kg: 220,
        image_url: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&q=80',
        is_available: true,
      },
      {
        name: 'Papaya',
        description: 'Buttery, mellow papaya with a gorgeous amber flesh. Rich in vitamins and enzymes.',
        price_per_kg: 55,
        season: 'year-round',
        category_id: cats['tropical'],
        stock_kg: 300,
        image_url: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=800&q=80',
        is_available: true,
      },
      {
        name: 'Strawberry',
        description: 'Plump winter strawberries from Rajshahi — deep red, fragrant and intensely sweet.',
        price_per_kg: 450,
        season: 'winter',
        category_id: cats['berries'],
        stock_kg: 40,
        image_url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80',
        is_available: true,
      },
      {
        name: 'Dates (Khejur)',
        description: 'Soft, caramel-sweet dates. A winter delicacy in Bangladesh — best eaten fresh from the palm.',
        price_per_kg: 520,
        season: 'winter',
        category_id: cats['dried-fruits'],
        stock_kg: 3,  // intentionally low for demo
        image_url: 'https://images.unsplash.com/photo-1548377599-d3c8e7e6e7e5?w=800&q=80',
        is_available: true,
      },
      {
        name: 'Dragon Fruit',
        description: 'Striking pink dragon fruit — mild and refreshing with a beautiful speckled white flesh.',
        price_per_kg: 380,
        season: 'summer',
        category_id: cats['tropical'],
        stock_kg: 0,  // out of stock for demo
        image_url: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=800&q=80',
        is_available: false,
      },
    ];

    let inserted = 0;
    for (const p of products) {
      // Check if product already exists
      const exists = await client.query('SELECT id FROM products WHERE name = $1', [p.name]);
      if (exists.rows.length > 0) {
        console.log(`  ⏭  Skipped (exists): ${p.name}`);
        continue;
      }

      await client.query(
        `INSERT INTO products
           (name, description, price_per_kg, season, category_id, stock_kg, image_url, is_available)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          p.name,
          p.description,
          p.price_per_kg,
          p.season,
          p.category_id ?? null,
          p.stock_kg,
          p.image_url,
          p.is_available,
        ]
      );
      inserted++;
      console.log(`  ✅ Inserted: ${p.name}`);
    }

    await client.query('COMMIT');
    console.log(`\n🌱 Seed complete! Inserted ${inserted} products.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedProducts().catch(console.error);
