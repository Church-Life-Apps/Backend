import { Pool } from 'pg'
require('dotenv').config();

const pool = new Pool({
    host: process.env.PG_HOST,
    port: (process.env.PORT || 25060) as number,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: { 
        ca: process.env.DB_CERT
    }
});

export default async function querySongs(): Promise<any[]> {
   return await queryDb('select * from test')
}

async function queryDb(query: string): Promise<any[]> {
    console.log(`Database Query: "${query}".`)
    return pool.query(query)
        .then((res) => { 
            console.log(`Returning ${res.rowCount} rows.`) 
            return res.rows
        })
        .catch((err) => {
            console.error(`Error due to: ${err}.`, err)
            return [];
        })
}
