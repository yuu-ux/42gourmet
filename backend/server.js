import { createServer } from "node:http";
import url from "url";
import dotenv from "dotenv";
import { initDatabase, getShops, getShopById } from "./db.js";

dotenv.config();

const hostname = "127.0.0.1";
const port = 3030;

const mainHandler = (req, res) => {
	res.statusCode = 200;
	res.setHeader("Content-Type", "text/plain");
	res.end("Hello world\n");
};

const shopHandler = async (req, res) => {
	const url_ = url.parse(req.url, true);
	const genre = url_.query.genre;

	try {
		const shops = await getShops(genre);
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/json");
		res.end(JSON.stringify(shops));
	} catch (error) {
		console.error("Error fetching shops:", error);
		res.statusCode = 500;
		res.setHeader("Content-Type", "text/plain");
		res.end("Internal Server Error");
	}
}

const notFoundHandler = (req, res) => {
	res.statusCode = 404;
	res.setHeader("Content-Type", "text/plain");
	res.end("Not found\n");
}


const router = async function (req, res){
 const url_ = url.parse(req.url, true);
 const pathname = url_.pathname;
 const shopIdMatch = pathname.match(/^\/shops\/(\d+)$/);

 if(req.method === "GET" && pathname === "/"){
	mainHandler(req, res);
 }else if(req.method === "GET" && pathname === "/shops"){
	shopHandler(req, res);
 } else if (req.method === "GET" && shopIdMatch) {
	const shopId = shopIdMatch[1];
	try {
		const shop = await getShopById(shopId);
		if (shop) {
			res.statusCode = 200;
			res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify(shop));
		} else {
			res.statusCode = 404;
			res.setHeader("Content-Type", "text/plain");
			res.end("Shop Not Found");
		}
	} catch (error) {
		console.error("Error fetching shop by ID:", error);
		res.statusCode = 500;
		res.setHeader("Content-Type", "text/plain");
		res.end("Internal Server Error");
	}
 } else {
	notFoundHandler(req, res);
 }
}


initDatabase().catch(console.error);
const server = createServer(router);
server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
