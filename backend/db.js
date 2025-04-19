import { createConnection } from "mysql2/promise"
import fs from "fs"
import csv from "csv-parser"
import dotenv from "dotenv"

dotenv.config({path: "../.env"});

const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
}

const filePath = process.env.SHOPS_CSV_PATH;

async function importShopsFromCSV(filePath, connection){
	return new Promise((res, rej)=>{
		const results = [];
		fs.createReadStream(filePath)
			.pipe(csv())
			.on("data", (data)=>results.push([
				data.id,
				data.name,
				data.address,
				data.open_time,
				data.close_time,
				data.price_level,
				data.latitude,
				data.longitude,
				data.genre
			]))
			.on("end", ()=>{
				const sql = `
					INSERT INTO places (id, name, address, open_time, close_time, price_level, latitude, longitude, genre)
					VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
				`;
				for(const row of results){
					try{
						connection.execute(sql, row);
					}catch(err){
						console.error(`Error inserting row: ${row.id}`, err);
					}
				}
				console.log(`Imported ${results.length} rows`);
				res();
			})
			.on("error", (err)=>rej(err))
	})
}

export async function getShops(){
	const connection = await createConnection(dbConfig);
	const [rows] = await connection.execute("SELECT * FROM places");
	return rows;
}

export async function getShopById(id) {
	const connection = await createConnection(dbConfig);
	const [rows] = await connection.execute("SELECT * FROM places WHERE id = ?", [id]);
	await connection.end();
	return rows[0] || null;
}

export async function initDatabase(){
	const connection = await createConnection(dbConfig);
	await connection.execute(`
		CREATE TABLE IF NOT EXISTS places (
		  id VARCHAR(255) PRIMARY KEY,
		  name VARCHAR(255) NOT NULL,
		  address VARCHAR(500),
		  open_time TEXT,
		  close_time TEXT,
		  price_level INT,
		  latitude DECIMAL(10, 8),
		  longitude DECIMAL(11, 8),
		  genre VARCHAR(255)
		);
	  `);

	  const [rows] = await connection.execute("SELECT id FROM places");
	  const count = rows.length;

	  if(count === 0){
		console.log("Importing data from CSV file...");
		await importShopsFromCSV(filePath, connection);
	  }else{
		console.log("Database already initialized");
	  }

	await connection.end();
}

