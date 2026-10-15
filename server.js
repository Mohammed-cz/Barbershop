const express = require('express');
const cors = require('cors'); // 1. إضافة مكتبة CORS
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // 2. السماح بجميع الطلبات الخارجية (من Netlify وغيره)
app.use(express.json());
app.use(express.static(__dirname));

const statusFilePath = path.join(__dirname, 'shop-status.json');

// Kasasaad ken default a skedol
function getDefaultWeeklySchedule() {
    const defaultDay = { isOpen: true, openTime: "09:00", closeTime: "19:00" };
    const closedDay = { isOpen: false, openTime: "09:00", closeTime: "19:00" };
    
    return {
        isOpen: true,
        weeklySchedule: {
            0: { ...defaultDay },
            1: { ...defaultDay },
            2: { ...defaultDay },
            3: { ...defaultDay },
            4: { ...defaultDay },
            5: { isOpen: true, openTime: "09:00", closeTime: "14:00" },
            6: { ...closedDay }
        }
    };
}

function getShopDataFromFile() {
    try {
        if (fs.existsSync(statusFilePath)) {
            const data = fs.readFileSync(statusFilePath, 'utf8');
            const parsed = JSON.parse(data);
            if (!parsed.weeklySchedule) {
                const defaults = getDefaultWeeklySchedule();
                defaults.isOpen = parsed.hasOwnProperty('isOpen') ? parsed.isOpen : true;
                return defaults;
            }
            return parsed;
        }
    } catch (err) {
        console.error('Error reading shop status file', err);
    }
    return getDefaultWeeklySchedule();
}

function saveShopDataToFile(newData) {
    try {
        const currentData = getShopDataFromFile();
        const updatedData = { ...currentData, ...newData };
        fs.writeFileSync(statusFilePath, JSON.stringify(updatedData, null, 2), 'utf8');
        return updatedData;
    } catch (err) {
        console.error('Error saving shop status file', err);
        return null;
    }
}

// 1. Alaen ti kasasaad ti shop ken skedol
app.get('/api/shop-status', (req, res) => {
    const data = getShopDataFromFile();
    res.json(data);
});

// 2. I-toggle ti emergency status
app.post('/api/toggle-shop', (req, res) => {
    const isOpen = req.body.isOpen;
    const updated = saveShopDataToFile({ isOpen });
    res.json({ success: true, isOpen: updated ? updated.isOpen : isOpen });
});

// 3. I-save ti skedol ti inaldaw
app.post('/api/set-weekly-schedule', (req, res) => {
    const { weeklySchedule } = req.body;
    const updated = saveShopDataToFile({ weeklySchedule });
    if (updated) {
        res.json({ success: true, weeklySchedule: updated.weeklySchedule });
    } else {
        res.status(500).json({ error: "Failed to save weekly schedule" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});