const express = require(express);
const app = express();


const dbRoute = express.Router();

const {getDB} = require('../db');

let user;

async function login(username, hashedPassword){
    dbRoute.get('/', async (q, r) => {
        try {
            const db = getDB();
            const sweetledgerUsers = await db.collection('users').find().toArray();
            for (const user of sweetledgerUsers){
                if (sweetledgerUsers[user].username.toLocaleLowerCase()===username.toLocaleLowerCase() && sweetledgerUsers[user].passwordHash===hashedPassword){
                    return sweetledgerUsers[user].role;
                }


            }
            return null;
        } catch (err) {
            r.status(500).json({ error: err.message });
        }
    });
}
