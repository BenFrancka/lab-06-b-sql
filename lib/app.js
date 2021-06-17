const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/meals', async(req, res) => {
  try {
    const data = await client.query('SELECT * from meals');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.get('/meals/:id', async(req, res) => {
  try {
    const data = await client.query('SELECT * from meals where id=$1', [req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.post('/meals', async(req, res) => {
  try {
    const data = await client.query(
      `insert into meals (name, in_stock, description, category, difficulty, price, owner_id)
      values ($1, $2, $3, $4, $5, $6, 1)
      returning *`,
      [
        req.body.name,
        req.body.in_stock,
        req.body.description,
        req.body.category,
        req.body.difficulty,
        req.body.price
      ]
    );
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.put('/meals/:id', async(req, res) => {
  try {
    const data = await client.query(`
      update meals
      set
        name=$1,
        in_stock=$2,
        description=$3,
        category=$4,
        difficulty=$5,
        price=$6
      where id=$7
      returning *`,
    [
      req.body.name,
      req.body.in_stock,
      req.body.description,
      req.body.category,
      req.body.difficulty,
      req.body.price,
      req.params.id
    ]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.delete('/meals/:id', async(req, res) => {
  try {
    const data = await client.query('delete * from meals where id=$1', [req.params.id]);
    
    res.json(data.rows[0]);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
