if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const MongoClient = require('mongodb').MongoClient;

const user = encodeURIComponent(process.env.DB_USER);
const password = encodeURIComponent(process.env.DB_PASS);

// Connection URL
const url = `mongodb+srv://${user}:${password}@sandbox.c86yv.mongodb.net/?retryWrites=true&w=majority`;

// Create a new MongoClient
const client = new MongoClient(url, { useUnifiedTopology: true });

async function run() {
  try {
    const startedAt = new Date();

    await client.connect();
    const database = client.db('sample_training');

    const companyCollection = client.db("sample_training").collection("companies");
    const companyCopyCollection = client.db("training_copy").collection("companies");

    console.log(`Found ${await companyCollection.countDocuments()} documents`);

    await deleteAll(companyCopyCollection);

    const cursor = find(companyCollection);
    await cursor.forEach((company) => {
      companyCopyCollection.insertOne(company);
    });

    console.log(`Copied ${await companyCopyCollection.countDocuments()} documents`);
    const endedAt = new Date();
    console.log(`Completed in ${(endedAt - startedAt) / 1000} seconds`);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

const find = (collection) => {
  return collection.find({}, {'batchSize':1000});
};

const deleteAll = (collection) => {
  return collection.deleteMany({})
};