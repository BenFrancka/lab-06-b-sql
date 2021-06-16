const client = require('../lib/client');
// import our seed data:
const meals = require('./meals.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      meals.map(meal => {
        return client.query(`
                    INSERT INTO meals (name, in_stock, description, category, difficulty,price, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
        [meal.name, meal.in_stock, meal.description, meal.category, meal.difficulty, meal.price, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
