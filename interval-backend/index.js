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

// Define a route to fetch centroid data
app.get('/api/electoral_label', async (req, res) => {
  try {
    // Query to get the centroid data from your table
    const query = `
      SELECT ogc_fid, english, ctrd_lat, ctrd_long 
      FROM tree_data.electoral_dublin
      WHERE ctrd_lat IS NOT NULL AND ctrd_long IS NOT NULL;
    `;
    
    // Execute the query
    const result = await pool.query(query);
    
    // Send the results as JSON response
    res.json(result.rows);
  } catch (err) {
    // Handle errors (e.g., if the query or connection fails)
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// GET route for statistics about trees within an electoral division
app.get('/api/electoral/:id?', async (req, res) => {
  const electoralId = req.params.id; // Use ogc_fid as the identifier

  try {
    let electoralGeom;
    let electoralName;

    if (electoralId) {
      // If electoralId is provided, get the geometry for that specific electoral division
      const electoralResult = await pool.query(
        'SELECT geom, english FROM tree_data.electoral_dublin WHERE ogc_fid = $1', 
        [electoralId]
      );

      if (electoralResult.rows.length === 0) {
        return res.status(404).json({ message: 'Electoral division not found' });
      }

      electoralGeom = electoralResult.rows[0].geom;
      electoralName = electoralResult.rows[0].english
    } else {
      // If no electoralId is provided, use a large geometry that covers the entire area (e.g., the world)
      electoralGeom = 'SRID=4326;POLYGON((-180 -90, 180 -90, 180 90, -180 90, -180 -90))';
    }

    const statsResult = await pool.query(`
      SELECT 
        COUNT(t.tree_id) AS total_trees,
        COUNT(DISTINCT t.species_id) AS total_species,
        (SELECT s.common_name 
         FROM tree_data.species s 
         JOIN tree_data.tree t2 ON s.species_id = t2.species_id
         WHERE ST_Within(t2.geom, $1)
         GROUP BY s.common_name 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) AS most_common_species,
        CASE WHEN COUNT(t.tree_id) > 0 
          THEN COUNT(t.tree_id) FILTER (WHERE t.is_public = TRUE) * 100 / NULLIF(COUNT(t.tree_id), 0) 
          ELSE 0 
        END AS public_percentage,
        CASE WHEN COUNT(t.tree_id) > 0 
          THEN COUNT(t.tree_id) FILTER (WHERE t.is_public = FALSE) * 100 / NULLIF(COUNT(t.tree_id), 0) 
          ELSE 0 
        END AS private_percentage,
        CASE WHEN COUNT(t.tree_id) > 0 
          THEN COUNT(DISTINCT CASE WHEN s.is_native = true THEN 1 END) * 100 / NULLIF(COUNT(t.tree_id), 0)
          ELSE 0 
        END AS native_percentage,
        CASE WHEN COUNT(t.tree_id) > 0 
          THEN COUNT(DISTINCT CASE WHEN s.is_native = false THEN 1 END) * 100 / NULLIF(COUNT(t.tree_id), 0)
          ELSE 0 
        END AS non_native_percentage
      FROM tree_data.tree t
      LEFT JOIN tree_data.species s ON t.species_id = s.species_id
      WHERE ST_Within(t.geom, $1)
    `, [electoralGeom]);

    // Query to get the species composition
    const speciesCompositionResult = await pool.query(`
      SELECT 
        s.species_id,
        s.species_code,
        s.scientific_name,
        s.common_name,
        COUNT(t.tree_id) * 100.0 / NULLIF(total.total_trees, 0) AS percentage
      FROM tree_data.species s
      JOIN tree_data.tree t ON s.species_id = t.species_id
      CROSS JOIN (
        SELECT COUNT(tree_id) AS total_trees
        FROM tree_data.tree
        WHERE ST_Within(geom, $1)
      ) total
      WHERE ST_Within(t.geom, $1)
      GROUP BY s.species_id, s.species_code, s.scientific_name, s.common_name, total.total_trees
      ORDER BY percentage DESC
    `, [electoralGeom]);

    // Query to aggregate ecological benefits by benefit type
    const ecologicalBenefitsResult = await pool.query(`
      SELECT 
        bt.benefit_name,
        SUM(eb.benefit_value) AS total_value,
        SUM(eb.monetary_value) AS total_monetary_value,
        u.unit_symbol
      FROM tree_data.ecological_benefit eb
      JOIN tree_data.ecological_benefit_types bt ON eb.benefit_type_id = bt.benefit_type_id
      JOIN tree_data.unit_of_measure u ON bt.unit_id = u.unit_id
      JOIN tree_data.tree t ON eb.tree_id = t.tree_id
      WHERE ST_Within(t.geom, $1)
      GROUP BY bt.benefit_name, u.unit_symbol
    `, [electoralGeom]);

    // Query to get the list of activities/issues for trees within the electoral division
    const activitiesResult = await pool.query(`
      SELECT 
        r.record_type, 
        r.record_description, 
        r.record_date
      FROM tree_data.tree_record r
      JOIN tree_data.tree t ON r.tree_id = t.tree_id
      WHERE ST_Within(t.geom, $1)
    `, [electoralGeom]);

    // Construct the response
    const statistics = {
      electoralName: electoralName? electoralName : 'all',  // Include the electoral name
      totalTrees: statsResult.rows[0].total_trees,
      totalSpecies: statsResult.rows[0].total_species,
      mostCommonSpecies: statsResult.rows[0].most_common_species,
      publicPercentage: statsResult.rows[0].public_percentage,
      privatePercentage: statsResult.rows[0].private_percentage,
      nativePercentage: statsResult.rows[0].native_percentage,
      nonNativePercentage: statsResult.rows[0].non_native_percentage,
      ecologicalBenefits: ecologicalBenefitsResult.rows.map((benefit) => ({
        name: benefit.benefit_name,
        totalValue: benefit.total_value,
        unit: benefit.unit_symbol,
        totalMonetaryValue: benefit.total_monetary_value
      })),
      speciesComposition: speciesCompositionResult.rows.map((species) => ({
        speciesId: species.species_id,
        speciesCode: species.species_code,
        scientificName: species.scientific_name,
        commonName: species.common_name,
        percentage: species.percentage
      })),
      activities: activitiesResult.rows.map((activity) => ({
        type: activity.record_type,
        description: activity.record_description,
        date: activity.record_date,
      })),
    };

    res.json(statistics);
  } catch (error) {
    console.error('Error fetching electoral tree statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST route for statistics about trees with filters, including boolean fields
app.post('/api/trees', async (req, res) => {
  const {
    species_id,   // List of species IDs
    condition,    // List of conditions
    height_min,   // Minimum value for tree height
    height_max,   // Maximum value for tree height
    trunk_min,    // Minimum value for trunk diameter
    trunk_max,    // Maximum value for trunk diameter
    spread_min,   // Minimum value for canopy spread
    spread_max,   // Maximum value for canopy spread
    userGeometry, // User-defined geometry (WKT format)
    is_native,    // Boolean filter for native species
    is_public     // Boolean filter for public/private trees
  } = req.body;

  try {
    let electoralGeom;

    if (userGeometry) {
      // If user-defined geometry is provided, use that
      electoralGeom = userGeometry;
      // electoralGeom = `ST_SetSRID(ST_GeomFromText('${userGeometry}'), 4326)`;
    } else {
      // If no userGeometry is provided, use a large geometry that covers the world
      electoralGeom = 'SRID=4326;POLYGON((-180 -90, 180 -90, 180 90, -180 90, -180 -90))';
    }

    // Build additional filter conditions for the tree and species tables
    const tFilters = [];  // Filters for tree table (t)
    const sFilters = [];  // Filters for species table (s)

    // Handle species_id filtering if it's a list 
    if (species_id && species_id.length > 0) {
      sFilters.push(`s.species_id IN (${species_id.join(',')})`);
      tFilters.push(`t.species_id IN (${species_id.join(',')})`);
    }

    // Handle condition filtering if it's a list
    if (condition && condition.length > 0) {
      const conditionList = condition.map(cond => `'${cond}'`).join(',');
      tFilters.push(`t.condition IN (${conditionList})`);
    }

    // Handle range filters for height, trunk, and spread using new params with partial ranges
    if (typeof height_min === 'number' && typeof height_max === 'number') {
      tFilters.push(`t.actual_height BETWEEN ${height_min} AND ${height_max}`);
    } else if (typeof height_min === 'number') {
      tFilters.push(`t.actual_height >= ${height_min}`);
    } else if (typeof height_max === 'number') {
      tFilters.push(`t.actual_height <= ${height_max}`);
    }

    if (typeof trunk_min === 'number' && typeof trunk_max === 'number') {
      tFilters.push(`t.actual_trunk BETWEEN ${trunk_min} AND ${trunk_max}`);
    } else if (typeof trunk_min === 'number') {
      tFilters.push(`t.actual_trunk >= ${trunk_min}`);
    } else if (typeof trunk_max === 'number') {
      tFilters.push(`t.actual_trunk <= ${trunk_max}`);
    }

    if (typeof spread_min === 'number' && typeof spread_max === 'number') {
      tFilters.push(`t.actual_spread BETWEEN ${spread_min} AND ${spread_max}`);
    } else if (typeof spread_min === 'number') {
      tFilters.push(`t.actual_spread >= ${spread_min}`);
    } else if (typeof spread_max === 'number') {
      tFilters.push(`t.actual_spread <= ${spread_max}`);
    }

    // Handle boolean filters for is_native and is_public
    if (typeof is_native === 'boolean') {
      sFilters.push(`s.is_native = ${is_native}`);
    }
    if (typeof is_public === 'boolean') {
      tFilters.push(`t.is_public = ${is_public}`);
    }

    // Combine the filters with the existing geometry filter
    let tFilterCondition = tFilters.length > 0 ? ` AND ${tFilters.join(' AND ')}` : '';
    let sFilterCondition = sFilters.length > 0 ? ` AND ${sFilters.join(' AND ')}` : '';

    // //negative filter

    // let n_tFilterCondition = tFilters.length > 0 ? ` AND NOT (${tFilters.join(' AND ')})` : '';
    // let n_sFilterCondition = sFilters.length > 0 ? ` AND NOT (${sFilters.join(' AND ')})` : '';


    const treeIdResult = await pool.query(`
      SELECT 
      t.tree_id
      FROM tree_data.tree t
      LEFT JOIN tree_data.species s ON t.species_id = s.species_id
      WHERE ST_Within(t.geom, $1) ${tFilterCondition} ${sFilterCondition}
    `, [electoralGeom]); //trees that are not satisfied by the filters, used for mapping styles

    const statsResult = await pool.query(`
      SELECT 
        COUNT(t.tree_id) AS total_trees,
        COUNT(DISTINCT t.species_id) AS total_species,
        (SELECT s.common_name 
         FROM tree_data.species s 
         JOIN tree_data.tree t2 ON s.species_id = t2.species_id
         WHERE ST_Within(t2.geom, $1) ${tFilterCondition.replace(/t\./g, 't2.')} ${sFilterCondition}
         GROUP BY s.common_name 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) AS most_common_species,
        CASE WHEN COUNT(t.tree_id) > 0 
          THEN COUNT(t.tree_id) FILTER (WHERE t.is_public = TRUE) * 100 / NULLIF(COUNT(t.tree_id), 0) 
          ELSE 0 
        END AS public_percentage,
        CASE WHEN COUNT(t.tree_id) > 0 
          THEN COUNT(t.tree_id) FILTER (WHERE t.is_public = FALSE) * 100 / NULLIF(COUNT(t.tree_id), 0) 
          ELSE 0 
        END AS private_percentage,
        CASE WHEN COUNT(t.tree_id) > 0 
          THEN COUNT(DISTINCT CASE WHEN s.is_native = true THEN 1 END) * 100 / NULLIF(COUNT(t.tree_id), 0)
          ELSE 0 
        END AS native_percentage,
        CASE WHEN COUNT(t.tree_id) > 0 
          THEN COUNT(DISTINCT CASE WHEN s.is_native = false THEN 1 END) * 100 / NULLIF(COUNT(t.tree_id), 0)
          ELSE 0 
        END AS non_native_percentage
      FROM tree_data.tree t
      LEFT JOIN tree_data.species s ON t.species_id = s.species_id
      WHERE ST_Within(t.geom, $1) ${tFilterCondition} ${sFilterCondition}
    `, [electoralGeom]);

    // Query to get the species composition
    const speciesCompositionResult = await pool.query(`
      SELECT 
        s.species_id,
        s.species_code,
        s.scientific_name,
        s.common_name,
        COUNT(t.tree_id) * 100.0 / NULLIF(total.total_trees, 0) AS percentage
      FROM tree_data.species s
      JOIN tree_data.tree t ON s.species_id = t.species_id
      CROSS JOIN (
        SELECT COUNT(tree_id) AS total_trees
        FROM tree_data.tree
        WHERE ST_Within(geom, $1) ${tFilterCondition.replace(/t\./g, '')}
      ) total
      WHERE ST_Within(t.geom, $1) ${tFilterCondition} ${sFilterCondition}
      GROUP BY s.species_id, s.species_code, s.scientific_name, s.common_name, total.total_trees
      ORDER BY percentage DESC 
    `, [electoralGeom]);

    // Query to aggregate ecological benefits by benefit type
    const ecologicalBenefitsResult = await pool.query(`
      SELECT 
        bt.benefit_name,
        SUM(eb.benefit_value) AS total_value,
        SUM(eb.monetary_value) AS total_monetary_value,
        u.unit_symbol
      FROM tree_data.ecological_benefit eb
      JOIN tree_data.ecological_benefit_types bt ON eb.benefit_type_id = bt.benefit_type_id
      JOIN tree_data.unit_of_measure u ON bt.unit_id = u.unit_id
      JOIN tree_data.tree t ON eb.tree_id = t.tree_id
      JOIN tree_data.species s ON t.species_id = s.species_id
      WHERE ST_Within(t.geom, $1) ${tFilterCondition} ${sFilterCondition}
      GROUP BY bt.benefit_name, u.unit_symbol
    `, [electoralGeom]);

    // Query to get the list of activities/issues for trees within the electoral division
    const activitiesResult = await pool.query(`
      SELECT 
        r.record_type, 
        r.record_description, 
        r.record_date
      FROM tree_data.tree_record r
      JOIN tree_data.tree t ON r.tree_id = t.tree_id
      JOIN tree_data.species s ON t.species_id = s.species_id
      WHERE ST_Within(t.geom, $1) ${tFilterCondition} ${sFilterCondition}
    `, [electoralGeom]);

    // Construct the response
    const statistics = {
      electoralName: 'Area of Interest', 
      treeIds:treeIdResult.rows.map(row => row.tree_id), 
      totalTrees: statsResult.rows[0].total_trees,
      totalSpecies: statsResult.rows[0].total_species,
      mostCommonSpecies: statsResult.rows[0].most_common_species,
      publicPercentage: statsResult.rows[0].public_percentage,
      privatePercentage: statsResult.rows[0].private_percentage,
      nativePercentage: statsResult.rows[0].native_percentage,
      nonNativePercentage: statsResult.rows[0].non_native_percentage,
      ecologicalBenefits: ecologicalBenefitsResult.rows.map((benefit) => ({
        name: benefit.benefit_name,
        totalValue: benefit.total_value,
        unit: benefit.unit_symbol,
        totalMonetaryValue: benefit.total_monetary_value
      })),
      speciesComposition: speciesCompositionResult.rows.map((species) => ({
        speciesId: species.species_id,
        speciesCode: species.species_code,
        scientificName: species.scientific_name,
        commonName: species.common_name,
        percentage: species.percentage
      })),
      activities: activitiesResult.rows.map((activity) => ({
        type: activity.record_type,
        description: activity.record_description,
        date: activity.record_date,
      })),
    };

    res.json(statistics);
    // console.log('stat', statistics.speciesComposition);
  } catch (error) {
    console.error('Error fetching tree statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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

// GET route to retrieve all species information
app.get('/api/species', async (req, res) => {
  try {
    const speciesResult = await pool.query(`
      SELECT 
        species_id,
        species_code,
        scientific_name,
        common_name,
        is_native
      FROM tree_data.species
      ORDER BY species_id
    `);

    // Send back the species data
    res.json({
      species: speciesResult.rows
    });
  } catch (error) {
    console.error('Error fetching species data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET route to retrieve distinct tree conditions
app.get('/api/conditions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT condition
      FROM tree_data.tree
      WHERE condition IS NOT NULL
      ORDER BY condition
    `);
    res.json({ conditions: result.rows });
  } catch (error) {
    console.error('Error fetching tree conditions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Listen on PORT
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});









