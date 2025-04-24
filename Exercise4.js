const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 3000;

app.use(express.json());

let db;

// Simulated auth via query param (?role=user or ?role=admin)
function isAdmin(req) {
    return req.query.role === 'admin';
}

// Logger
app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`);
    next();
});

// Connect to MongoDB
async function connectToMongoDB() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("MongoDB connected");
        db = client.db("testdb");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("DB connection failed:", err);
    }
}

// ────── USER ROUTES ──────

// POST /rides - Book a new ride
app.post('/rides', async (req, res) => {
    const { pickupLocation, dropoffLocation, status } = req.body;

    if (!pickupLocation || !dropoffLocation || !status) {
        return res.status(400).json({ error: "Missing required ride fields" });
    }

    try {
        const result = await db.collection('rides').insertOne({
            pickupLocation,
            dropoffLocation,
            status,
            createdAt: new Date()
        });

        res.status(201).json({ id: result.insertedId });
    } catch {
        res.status(500).json({ error: "Failed to create ride" });
    }
});

// GET /rides - View all rides
app.get('/rides', async (req, res) => {
    try {
        const rides = await db.collection('rides').find().toArray();
        res.status(200).json(rides);
    } catch {
        res.status(500).json({ error: "Failed to fetch rides" });
    }
});

// ────── ADMIN ROUTES ──────

// GET /admin/rides - Admin: view all rides
app.get('/admin/rides', async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: "Admin access required" });

    try {
        const rides = await db.collection('rides').find().toArray();
        res.status(200).json(rides);
    } catch {
        res.status(500).json({ error: "Failed to fetch rides" });
    }
});

// PATCH /admin/rides/:id - Admin updates ride status
app.patch('/admin/rides/:id', async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: "Admin access required" });

    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "Missing 'status' in body" });

    try {
        const result = await db.collection('rides').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "Ride not found" });
        }

        res.status(200).json({ updated: result.modifiedCount });
    } catch {
        res.status(400).json({ error: "Invalid ride ID format" });
    }
});

// DELETE /admin/rides/:id - Admin deletes a ride
app.delete('/admin/rides/:id', async (req, res) => {
    if (!isAdmin(req)) return res.status(403).json({ error: "Admin access required" });

    try {
        const result = await db.collection('rides').deleteOne({ _id: new ObjectId(req.params.id) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Ride not found" });
        }

        res.status(200).json({ deleted: result.deletedCount });
    } catch {
        res.status(400).json({ error: "Invalid ride ID format" });
    }
});

connectToMongoDB();
