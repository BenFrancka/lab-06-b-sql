require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

const meals = [
  {
    id: 1,
    name: 'Chicken Enchiladas',
    in_stock: true,
    description: 'Blue corn tortillas with pulled chicken, chile verde sauce, cotija cheese, and fresh cilantro',
    category: 'Mexican',
    difficulty: 'easy',
    price: 10,
    owner_id: 1
  },
  {
    id: 2,
    name: 'Spaghetti with Pork Meatballs',
    in_stock: false,
    description: 'Handmade spaghetti noodles with classic red sauce, pork meatball kit, fresh basil, and parmigiano reggiano',
    category: 'Italian',
    difficulty: 'medium',
    price: 12,
    owner_id: 1
  },
  {
    id: 3,
    name: 'Bison Cheeseburgers',
    in_stock: true,
    description: 'Grass fed bison patties with brioche buns, smoked gouda cheese, and quick pickle kit',
    category: 'American',
    difficulty: 'medium',
    price: 20,
    owner_id: 1
  },
  {
    id: 4,
    name: 'Spicy Shoyu Ramen',
    in_stock: false,
    description: 'Gourmet Instant Ramen kit with pork belly, chili oil, and eggs',
    category: 'Japanese',
    difficulty: 'hard',
    price: 20,
    owner_id: 1
  },
  {
    id: 5,
    name: 'Spicy Tuna Rolls',
    in_stock: true,
    description: 'Sushi rolling kit (includes bamboo mat), albacore belly tuna, rice, nori, hot sauce, black sesame seeds, scallions',
    category: 'Japanese',
    difficulty: 'hard',
    price: 25,
    owner_id: 1
  },
  {
    id: 6,
    name: 'Pepperoni Pizza',
    in_stock: true,
    description: 'Detroit style deep dish pizza, includes dough kit, sauce, buffalo mozzarella, and aged pepperoni',
    category: 'American/Italian',
    difficulty: 'easy',
    price: 12,
    owner_id: 1
  },
  {
    id: 7,
    name: 'Veggie Tacos',
    in_stock: false,
    description: 'Corn tortillas, fire-roasted salsa, zuchinni, nopalitos, mushrooms, lime, and fresh cilantro',
    category: 'Mexican',
    difficulty: 'medium',
    price: 10,
    owner_id: 1
  }
];

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('/GET meals returns all meals', async() => {

      const expectation = meals;

      const data = await fakeRequest(app)
        .get('/meals')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('/GET meals/3 returns a single meal', async() => {

      const expectation = {
        id: 3,
        name: 'Bison Cheeseburgers',
        in_stock: true,
        description: 'Grass fed bison patties with brioche buns, smoked gouda cheese, and quick pickle kit',
        category: 'American',
        difficulty: 'medium',
        price: 20,
        owner_id: 1
      };

      const data = await fakeRequest(app)
        .get('/meals/3')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

  });
});

test('/POST meals creates a single meal', async() => {

  // makes a request to create new meal
  const data = await fakeRequest(app)
    .post('/meals')
    .send({
      name: 'new meal',
      in_stock: true,
      description: 'new description',
      category: 'new category',
      difficulty: 'easy',
      price: 10
    })
    .expect('Content-Type', /json/)
    .expect(200);

  // makes a request to see all meals
  const dataMeal = await fakeRequest(app)
    .get('/meals')
    .expect('Content-Type', /json/)
    .expect(200);

  const newMeal = { 
    'id': 8,
    'name': 'new meal',
    'in_stock': true,
    'description': 'new description',
    'category': 'new category',
    'difficulty': 'easy',
    'price': 10,
    'owner_id': 1,
  };

  // checks that the post request responds with the new meal
  expect(data.body).toEqual(newMeal);
  // checks that the get request contians the new meal
  expect(dataMeal.body).toContainEqual(newMeal);
});