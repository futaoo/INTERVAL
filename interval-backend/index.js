import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import pg from 'pg';

// Create Express server
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON requests

// Destructure Pool from the pg module
const { Pool } = pg;
// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Basic route to check if the server is running
app.get('/', (req, res) => {
  res.send('Tree Data API is running');
});

// Define the GET endpoint to get tree data by tree ID
app.get('/api/trees/:id', async (req, res) => {
  const treeId = req.params.id;

  try {
    // Fetch basic tree, species, and condition information
    const treeResult = await pool.query(`
      SELECT 
        t.tree_id,
        t.closest_address, 
        t.actual_height, 
        t.actual_trunk, 
        t.actual_spread, 
        t.condition, 
        s.common_name AS species_common_name, 
        s.scientific_name AS species_scientific_name, 
        s.species_code AS species_id
      FROM tree_data.tree t
      LEFT JOIN tree_data.species s ON t.species_id = s.species_id
      WHERE t.tree_id = $1`, [treeId]);

    if (treeResult.rows.length === 0) {
      return res.status(404).json({ message: 'Tree not found' });
    }

    // Fetch ecological benefits for the tree
    const ecologicalResult = await pool.query(`
      SELECT 
        bt.benefit_name,
        eb.benefit_value,
        eb.monetary_value,
        u.unit_symbol
      FROM tree_data.ecological_benefit eb
      JOIN tree_data.ecological_benefit_types bt ON eb.benefit_type_id = bt.benefit_type_id
      JOIN tree_data.unit_of_measure u ON bt.unit_id = u.unit_id
      WHERE eb.tree_id = $1`, [treeId]);

    // Fetch records (activities/issues) for the tree
    const recordResult = await pool.query(`
      SELECT 
        record_type, 
        record_description, 
        record_date 
      FROM tree_data.tree_record
      WHERE tree_id = $1`, [treeId]);

    // Construct the response based on your schema
    const treeData = {
      treeId: treeResult.rows[0].tree_id,
      closestAddress: treeResult.rows[0].closest_address,
      height: treeResult.rows[0].actual_height,
      trunkDiameter: treeResult.rows[0].actual_trunk,
      canopySpread: treeResult.rows[0].actual_spread,
      condition: treeResult.rows[0].condition,
      species: {
        speciesCommonName: treeResult.rows[0].species_common_name,
        speciesScientificName: treeResult.rows[0].species_scientific_name,
        speciesImageUrl: `/assets/species/${treeResult.rows[0].species_id}.webp`
      },
      ecologicalBenefits: ecologicalResult.rows.map((benefit) => ({
        name: benefit.benefit_name,
        value: benefit.benefit_value,
        unit: benefit.unit_symbol,
        monetary: benefit.monetary_value
      })),
      inspections: recordResult.rows.map((record) => ({
        date: record.record_date,
        type: record.record_type,
        description: record.record_description
      }))
    };

    res.json(treeData);
  } catch (error) {
    console.error('Error fetching tree data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Listen on PORT
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});









