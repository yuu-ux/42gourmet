import { createServer } from "node:http";
import url from "url";
import dotenv from "dotenv";
import { initDatabase, getShops } from "./db.js";

dotenv.config();

const hostname = "127.0.0.1";
const port = 3030;

const apiKey = process.env.GOOGLE_MAP_API_KEY;

const mainHandler = (req, res) => {
	res.statusCode = 200;
	res.setHeader("Content-Type", "text/plain");
	res.end("Hello world\n");
	console.log(apiKey);
};

const shopHandler = async (req, res) => {
	res.statusCode = 200;
	res.setHeader("Content-Type", "application/json");
	const shops = await getShops();
	res.end(JSON.stringify(shops));
}

const notFoundHandler = (req, res) => {
	res.statusCode = 404;
	res.setHeader("Content-Type", "text/plain");
	res.end("Not found\n");
}


const router = async function (req, res){
 const url_ = url.parse(req.url, true);
 const pathname = url_.pathname;

 if(req.method === "GET" && pathname === "/"){
	mainHandler(req, res);
 }else if(req.method === "GET" && pathname === "/shops"){
	shopHandler(req, res);
 }else {
	notFoundHandler(req, res);
 }
}


initDatabase().catch(console.error);
const server = createServer(router);
server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
