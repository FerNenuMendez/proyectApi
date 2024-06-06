import { MODO_EJECUCION } from "../../config/config";
import { getClientesDaoMongoose } from './mongoose/clientes.dao.mongoose.js'
import { getClientesDaoFiles } from "./files/clientes.dao.files.js";


let getDaoClientes
//SINGLETON

if (MODO_EJECUCION === 'online') {
    getDaoClientes = getClientesDaoMongoose
    console.log('persistiendo Clientes en: MongoDB')
} else {
    getDaoClientes = getClientesDaoFiles
    console.log('persistiendo Clientes en: Sistema de archivos')
}

export {
    getDaoClientes
}