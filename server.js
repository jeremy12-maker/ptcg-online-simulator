const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// 連接 MongoDB 雲端資料庫
const mongoUri = process.env.MONGO_URI || '';
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('✅ 成功連線至 MongoDB 雲端資料庫'))
    .catch(err => console.error('❌ 資料庫連線失敗:', err));
}

// 定義資料庫結構：倉庫 (Warehouse) 裡面包含多張卡牌
const warehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  cards: [{
    cardId: String,
    name: String,
    type: String,
    image: String
  }]
});

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

// API 1: 取得所有倉庫列表與其內容
app.get('/api/warehouses', async (req, res) => {
  try {
    const list = await Warehouse.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 2: 建立新的倉庫
app.post('/api/warehouse', async (req, res) => {
  try {
    const { name } = req.body;
    const newWarehouse = new Warehouse({ name, cards: [] });
    await newWarehouse.save();
    res.json({ success: true, warehouse: newWarehouse });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API 3: 新增卡牌到指定的倉庫中
app.post('/api/warehouse/:id/card', async (req, res) => {
  try {
    const { id } = req.params;
    const cardData = { cardId: 'c_' + Date.now(), ...req.body };
    
    const warehouse = await Warehouse.findById(id);
    if (!warehouse) return res.status(404).json({ error: '找不到此倉庫' });

    warehouse.cards.push(cardData);
    await warehouse.save();
    res.json({ success: true, card: cardData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 雲端伺服器運行於 http://localhost:${PORT}`);
});