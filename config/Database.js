import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import mysql2 from "mysql2"

dotenv.config();

const db = new Sequelize(process.env.MYSQL_URL,{
    "dialect" : "mysql",
    "dialectModule" : mysql2
});

export default db;