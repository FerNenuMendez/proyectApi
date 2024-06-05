import { Schema, model, connect } from 'mongoose'
import { randomUUID } from 'node:crypto'
import dotenv from "dotenv";

dotenv.config();

const MONGODB_CNX_STR = `${process.env.MongoLocal__CNX__STR}`
