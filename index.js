const { MongoClient } = require('mongodb');

async function main() {
const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB server successfully.");

        const database = client.db("testdb");
        const collection = database.collection("users");

        // Insert a document 
        await collection.insertOne({ name: "Alice", age: 25 });
        console.log("Document inserted successfully.");

        // Query a document 
        const result = await collection.findOne({ name: "Alice" });
        console.log("Query result:", result);
    } catch (error) {
        console.error("Error connecting to MongoDB server:", error);
    } finally {
        await client.close();
    }

}

main();