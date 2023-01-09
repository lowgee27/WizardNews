const pg = require('pg');
const client = new pg.Client('postgres://localhost/wizard_news_db'); 

const sync = async()=> {
  const SQL = `
  DROP TABLE IF EXISTS posts;
  DROP TABLE IF EXISTS users;
  CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT DEFAULT NULL
  );
  CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES users(id) NOT NULL,
    title varchar(255) DEFAULT NULL,
    content TEXT DEFAULT NULL,
    date timestamp DEFAULT now()
  );
`;
  await client.query(SQL);
};

const createPost = async(title, content, userId)=> {
  return (await client.query('INSERT INTO posts(title, content, userId) VALUES ($1, $2, $3) returning *', [title, content, userId])).rows[0];

};
const createUser = async(name)=> {
  return (await client.query('INSERT INTO users(name) VALUES ($1) returning *', [name])).rows[0];
}

const getPosts = async()=> {
  const SQL = `
    SELECT title, name, posts.id
    FROM posts
    JOIN users
    ON posts.userId = users.id
  `;
  return (await client.query(SQL)).rows;
};

const getPost = async(id)=> {
  const SQL = `
    SELECT title, name, posts.id, content
    FROM posts
    JOIN users
    ON posts.userId = users.id
    WHERE posts.id = $1
  `;
  return (await client.query(SQL, [id])).rows[0];
};
const seed = async()=> {
  const [prof, nick] = await Promise.all([
    createUser('prof'),
    createUser('nick')
  ]);
  await Promise.all([
    createPost('cats', 'I love my cats', nick.id),
    createPost('abstractions', 'I love abstractions', prof.id),
    createPost('nicknames', 'In High School they called me Wizard News', prof.id)
  ]);

};

const syncAndSeed = async()=> {
  await client.connect();
  await sync();
  await seed();
  console.log('yes');
};

module.exports = {
  syncAndSeed,
  getPosts,
  getPost
}