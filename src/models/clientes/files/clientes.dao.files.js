import { randomUUID } from 'node:crypto';
import { matches } from '../../utils/utils.js';
import fs from 'fs/promises';

const RUTA_CLIENTES_JSON = './db/clientes.json'

class Cliente {
    constructor({ _id = randomUUID(), nombre, apellido, dni, telefono, mail, domicilio, nacimiento, eCivil, userID, inventario }) {
        this._id = _id;
        this._nombre = nombre;
        this._apellido = apellido;
        this._dni = dni;
        this._telefono = telefono;
        this._mail = mail;
        this._domicilio = domicilio;
        this._nacimiento = nacimiento;
        this._eCivil = eCivil;
        this._userID = userID;
        this._inventario = inventario;
    }

    get id() { return this._id; }
    get nombre() { return this._nombre; }
    get apellido() { return this._apellido; }
    get dni() { return this._dni; }
    get telefono() { return this._telefono; }
    get mail() { return this._mail; }
    get domicilio() { return this._domicilio; }
    get nacimiento() { return this._nacimiento; }
    get eCivil() { return this._eCivil; }
    get userID() { return this._userID; }
    get inventario() { return this._inventario; }

    set nombre(value) {
        if (!value) throw new Error('El nombre es obligatorio');
        this._nombre = value;
    }

    set apellido(value) {
        if (!value) throw new Error('El apellido es obligatorio');
        this._apellido = value;
    }

    set dni(value) {
        if (!value) throw new Error('El DNI es obligatorio');
        if (typeof value !== 'number') throw new Error('El DNI debe ser un número');
        this._dni = value;
    }

    set telefono(value) {
        if (!value) throw new Error('El teléfono es obligatorio');
        if (typeof value !== 'number') throw new Error('El teléfono debe ser un número');
        this._telefono = value;
    }

    set mail(value) {
        if (!value) throw new Error('El mail es obligatorio');
        if (!/\S+@\S+\.\S+/.test(value)) throw new Error('El mail debe ser una dirección válida');
        this._mail = value;
    }

    set domicilio(value) {
        if (!value) throw new Error('El domicilio es obligatorio');
        this._domicilio = value;
    }

    set nacimiento(value) {
        if (!value) throw new Error('La fecha de nacimiento es obligatoria');
        if (!(value instanceof Date)) throw new Error('La fecha de nacimiento debe ser una fecha válida');
        this._nacimiento = value;
    }

    set eCivil(value) {
        if (!value) throw new Error('El estado civil es obligatorio');
        this._eCivil = value;
    }

    set userID(value) {
        if (!value) throw new Error('El userID es obligatorio');
        this._userID = value;
    }

    set inventario(value) {
        if (!Array.isArray(value)) throw new Error('El inventario debe ser un array');
        this._inventario = value;
    }

    toPOJO() {
        return {
            _id: this._id,
            nombre: this._nombre,
            apellido: this._apellido,
            dni: this._dni,
            telefono: this._telefono,
            mail: this._mail,
            domicilio: this._domicilio,
            nacimiento: this._nacimiento,
            eCivil: this._eCivil,
            userID: this._userID,
            inventario: this._inventario
        };
    }
}

class ClientesDaoFiles {
    constructor(path) {
        this.path = path;
    }

    async readClientes() {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                await this.writeClientes([]);
                return [];
            }
            throw error;
        }
    }

    async writeClientes(clientes) {
        await fs.writeFile(this.path, JSON.stringify(clientes, null, 2));
    }

    async create(data) {
        const cliente = new Cliente(data);
        const clientePojo = cliente.toPOJO();
        const clientes = await this.readClientes();
        clientes.push(clientePojo);
        await this.writeClientes(clientes);
        return clientePojo;
    }

    async readOne(query) {
        const clientes = await this.readClientes();
        return clientes.find(matches(query));
    }

    async readMany(query) {
        const clientes = await this.readClientes();
        return clientes.filter(matches(query));
    }

    async updateOne(query, data) {
        const clientes = await this.readClientes();
        const indexBuscado = clientes.findIndex(matches(query));
        if (indexBuscado !== -1) {
            const clienteActualizado = { ...clientes[indexBuscado], ...data };
            clientes[indexBuscado] = clienteActualizado;
            await this.writeClientes(clientes);
            return clienteActualizado;
        }
        return null;
    }

    async updateMany(query, data) {
        const clientes = await this.readClientes();
        let updatedCount = 0;
        clientes.forEach((cliente, index) => {
            if (matches(query)(cliente)) {
                clientes[index] = { ...cliente, ...data };
                updatedCount++;
            }
        });
        if (updatedCount > 0) {
            await this.writeClientes(clientes);
        }
        return updatedCount;
    }

    async deleteOne(query) {
        const clientes = await this.readClientes();
        const indexBuscado = clientes.findIndex(matches(query));
        if (indexBuscado !== -1) {
            const [buscado] = clientes.splice(indexBuscado, 1);
            await this.writeClientes(clientes);
            return buscado;
        }
        return null;
    }

    async deleteMany(query) {
        const clientes = await this.readClientes();
        const initialLength = clientes.length;
        const filteredClientes = clientes.filter(cliente => !matches(query)(cliente));
        const deletedCount = initialLength - filteredClientes.length;
        if (deletedCount > 0) {
            await this.writeClientes(filteredClientes);
        }
        return deletedCount;
    }

    async readAll() {
        return await this.readClientes();
    }

    async readById(id) {
        const clientes = await this.readClientes();
        const cliente = clientes.find(cliente => cliente._id === id);
        if (!cliente) {
            throw new Error('Cliente not found');
        }
        return cliente;
    }
}

const clientesDaoFiles = new ClientesDaoFiles(RUTA_CLIENTES_JSON)

export async function getClientesDaoFiles() {
    return clientesDaoFiles
}