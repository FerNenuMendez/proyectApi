import { app } from './app/app.js'
import { PORT } from './config/config.js'
import { connect } from './dataBase/dataBase.js'

await connect()
app.listen(PORT, () => { console.log(`Servidor Conectado con exito`) })