require('dotenv').config()
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://task-linker.vercel.app'],
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.json());
// middleware for verify the token
const verifyToken = async (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = req.headers.authorization;
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zrua0aj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Database collections
        const db = client.db('taskLink_DB');
        const usersCollection = db.collection('users');
        // middlewares for secure authorization
        const verifyWorker = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const isWorker = user?.role === 'worker';
            if (!isWorker) {
                return res.status(403).send({ massage: "forbidden access" });
            }
            next();
        }
        const verifyTaskCreator = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const isTaskCreator = user?.role === 'task_creator';
            if (!isTaskCreator) {
                return res.status(403).send({ massage: "forbidden access" });
            }
            next();
        }
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const isAdmin = user?.role === 'admin';
            if (!isAdmin) {
                return res.status(403).send({ massage: "forbidden access" });
            }
            next();
        }
        // api code goes here





        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.status(200).send({ success: true, massage: "TaskLinker Server is running" })
})
app.listen(port, () => {
    console.log(`Server listening at port ${port}`);
})
