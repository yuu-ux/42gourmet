const express = require('express');
const fs = require('fs');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;
const DB_FILE = 'stores.json';

app.use(cors());
app.use(bodyParser.json());

// ストア情報を取得
app.get('/api/stores', (req, res) => {
    if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify([]));
    }
    const stores = JSON.parse(fs.readFileSync(DB_FILE));
    res.json(stores);
});

// ストア情報を登録
app.post('/api/stores', (req, res) => {
    const newStore = req.body;
    const stores = JSON.parse(fs.readFileSync(DB_FILE));
    stores.push(newStore);
    fs.writeFileSync(DB_FILE, JSON.stringify(stores));
    res.json({ success: true, message: 'Store registered successfully.' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
