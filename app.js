require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { inicializarBD } = require('./database/initDB');

// Importar rutas
const authRoutes = require('./Routes/auth.routes');
const usuariosRoutes = require('./Routes/usuarios.routes');
const cursosRoutes = require('./Routes/cursos.routes');
const materiasRoutes = require('./Routes/materias.routes');
const notasRoutes = require('./Routes/notas.routes');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Rutas base del API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/cursos', cursosRoutes);
app.use('/api/materias', materiasRoutes);
app.use('/api/notas', notasRoutes);


// Puerto desde .env o 3000 por defecto
const PORT = process.env.PORT || 3000;

// Inicializar BD y luego levantar servidor
(async () => {
  try {
    await inicializarBD();
    app.listen(PORT, () => {
      console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar la base de datos:', error);
  }
})();
