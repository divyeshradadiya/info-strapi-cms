const { Client } = require('pg');

const connectionString = "postgresql://dama_owner:esr8ZDR9BwYO@ep-yellow-king-a1gcoebp-pooler.ap-southeast-1.aws.neon.tech/blog-site?sslmode=require";

const client = new Client({
  connectionString: connectionString,
  ssl: { rejectUnauthorized: false }
});

console.log('Testing database connection...');

client.connect()
  .then(() => {
    console.log('✅ Successfully connected to the database!');
    return client.query('SELECT NOW()');
  })
  .then((result) => {
    console.log('✅ Query executed successfully:', result.rows[0]);
    return client.end();
  })
  .then(() => {
    console.log('✅ Connection closed successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  });
