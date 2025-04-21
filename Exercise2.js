const { MongoClient } = require('mongodb');

const drivers = [
    { 
        name: "John Doe",
        vehicleType: "sedan", 
        isAvailable: true,
        rating: 4.8
    },
    { 
        name: "Alice Smith",
        vehicleType: "SUV", 
        isAvailable: false,
        rating: 4.5
    },
]

//show the data in the console
console.log(drivers);

//TODO: show the all drivers names in the console
drivers.forEach((driver) => {console.log(driver)});

//TODO: add a new driver to the array
drivers.push({ 
    name: "Bob Johnson",
    vehicleType: "truck", 
    isAvailable: true,
    rating: 4.2, 
});
console.log(drivers);

async function main() {
const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri);

    try {
        await client.connect();
        const database = client.db("testdb");

        const driverscollection = database.collection("drivers");

        drivers.forEach(async (driver) => { 
            const result = await driverscollection.insertOne(driver);
            console.log(`New driver created with result: ${result}`);
        });

        const availableDrivers = await driverscollection.find({ 
            isAvailable: true,
            rating: { $gte:4.5 }
         }).toArray();
        console.log("Available drivers:", availableDrivers);

        drivers.forEach (async (driver) => {
            const result = await driverscollection.insertOne(driver);
            console.log(`New driver created with result: ${result}`);
        });

        const updateresult = await database.collection('drivers').updateOne(
                { name: "John Doe" },
                { $inc: { rating: 0.1 } }
            );
        console.log(`Driver updated with result ${updateresult}`);

        const deleteresult = await database.collection('drivers').deleteOne(
            { isAvailable: false }
        );
        console.log(`Driver deleted with result ${deleteresult}`);

    } finally {
        await client.close();
    }

}

main();