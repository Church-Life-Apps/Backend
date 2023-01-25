import { Pool, Client } from 'pg'
import fs from 'fs'
require('dotenv').config();

const pool = new Pool({
    host: process.env.PG_HOST,
    port: 25060,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: {
        ca: fs.readFileSync(process.env.CA_CERT_FILEPATH ?? "").toString()
    }
});

export default async function querySongs() {
   queryDb('select * from test')
}

async function queryDb(query: string): Promise<any[]> {
    console.log(`Database Query: "${query}".`)
    return pool.query(query)
        .then((res) => { 
            console.log(`Returning ${res.rowCount} rows.`) 
            return res.rows
        })
        .catch((err) => {
            console.error(`Error due to: ${err}.`)
            return [];
        })
}
