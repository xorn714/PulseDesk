import 'dotenv/config';
import express from 'express';
import { drizzle } from 'drizzle-orm/node-postgres';

const db_url = process.env.DATABASE_URL;

if (!db_url) {
    throw new Error("No se encontro la variable de entorno de DATABASE_URL");
}
const db = drizzle(db_url);
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
})

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
});