const client = require('../lib/client');
// import our seed data:
const meals = require('./meals.js');
const usersData = require('./users.js');
const categoriesData = require('./categories.js');
const { getEmoji } = require('../lib/emoji.js');
const { getCategoryIdByName } = require('../lib/utils.js');

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

    const categoriesCall = await Promise.all(
      categoriesData.map(category => {
        return client.query(`
          INSERT INTO categories (name)
          VALUES ($1)
          RETURNING *;
        `,
        [category.name]);
      })
    );

    const categories = categoriesCall.map(response => {
      return response.rows[0];
    });



    await Promise.all(
      meals.map(meal => {
        const category_id = getCategoryIdByName(categories, meal.category);

        return client.query(`
                    INSERT INTO meals (name, in_stock, description, category_id, difficulty,price, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
        [meal.name, meal.in_stock, meal.description, category_id, meal.difficulty, meal.price, user.id]);
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
