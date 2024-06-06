import { Schema, model, connect } from 'mongoose'
import { randomUUID } from 'node:crypto'
import dotenv from "dotenv";

dotenv.config();

const MONGODB_CNX_STR = `${process.env.MongoLocal__CNX__STR}`

const collection = 'Clientes'

export const clientesSchema = new Schema({
    id: { type: String, default: randomUUID, unique: true, required: true },
    nombre: { type: String, required: true },
    apellido: { type: String, required: true },
    dni: { type: Number, unique: true, required: true },
    telefono: { type: Number, required: true },
    mail: { type: String, unique: true, required: true },
    domicilio: { type: String, required: true },
    nacimiento: { type: Date, },
    eCivil: { type: String },
    userID: { type: Schema.Types.ObjectId, ref: 'User', unique: true },
    inventario: [{}]
}, {
    strict: 'throw',
    versionKey: false,
})

clientesSchema.index({ id: 1 }, { unique: true });

const ClientesModel = model(collection, clientesSchema)

class ClientesDaoMongoose {

    constructor() {
        if (!ClientesDaoMongoose.instance) {
            this.ClientesModel = ClientesModel;
            ClientesDaoMongoose.instance = this;
        }
        return ClientesDaoMongoose.instance;
    }

    async create(data) {
        const cliente = await this.ClientesModel.create(data);
        return cliente.toObject();
    }

    async readOne(query) {
        const cliente = await this.ClientesModel.findOne(query).lean();
        return cliente;
    }

    async readMany(query) {
        return await this.ClientesModel.find(query).lean();
    }

    async updateOne(query, data) {
        const updatedCliente = await this.ClientesModel.findOneAndUpdate(query, data, { new: true }).lean();
        if (!updatedCliente) {
            throw new Error('Cliente not found');
        }
        return updatedCliente;
    }

    async updateMany(query, data) {
        const updatedClientes = await this.ClientesModel.updateMany(query, data).lean();
        return updatedClientes;
    }

    async deleteOne(query) {
        return await this.ClientesModel.findOneAndDelete(query).lean();
    }

    async deleteMany(query) {
        throw new Error('deleteMany method not implemented');
    }

    async readAll() {
        return await this.ClientesModel.find({}).lean();
    }

    async readById(id) {
        const cliente = await this.ClientesModel.findById(id).lean();
        if (!cliente) {
            throw new Error('Cliente not found');
        }
        return cliente;
    }
}

let clientesDaoMongoose

export async function getClientesDaoMongoose() {
    if (!ClientesDaoMongoose) {
        await connect(MONGODB_CNX_STR)
        clientesDaoMongoose = new ClientesDaoMongoose()
    }
    return clientesDaoMongoose
}