const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('confirmaciones.db');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// servir archivos estáticos desde public y static
app.use(express.static('public'));
app.use('/static', express.static('static'));

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS confirmaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    asistencia TEXT NOT NULL,
    acompanantes INTEGER DEFAULT 0,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Ruta principal - formulario
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Recibir confirmaciones
app.post('/confirmar', (req, res) => {
    const { nombre, asistencia, acompanantes } = req.body;
    
    db.run(
        'INSERT INTO confirmaciones (nombre, asistencia, acompanantes) VALUES (?, ?, ?)',
        [nombre, asistencia, acompanantes || 0],
        function(err) {
            if (err) {
                console.error(err);
                res.status(500).send('Error al guardar');
            } else {
                // Redirigir a confirmacion.html con el nombre
                res.redirect(`/confirmacion.html?nombre=${encodeURIComponent(nombre)}`);
            }
        }
    );
});

// Panel de administración
app.get('/admin', (req, res) => {
    db.all('SELECT * FROM confirmaciones ORDER BY fecha DESC', [], (err, rows) => {
        if (err) {
            res.status(500).send('Error');
        } else {
            let html = `
                <html>
                <head><title>Confirmaciones</title>
                <style>
                    body { font-family: Arial; padding: 20px; background: #f8f4f0; }
                    h1 { color: #b76e79; }
                    table { border-collapse: collapse; width: 100%; background: white; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #b76e79; color: white; }
                </style>
                </head>
                <body>
                <h1>Confirmaciones de asistencia</h1>
                <table>
                    <tr><th>ID</th><th>Nombre</th><th>Asistencia</th><th>Acompañantes</th><th>Fecha</th></tr>
            `;
            
            rows.forEach(row => {
                html += `<tr>
                    <td>${row.id}</td>
                    <td>${row.nombre}</td>
                    <td>${row.asistencia === 'si' ? '✅ Sí' : '❌ No'}</td>
                    <td>${row.acompanantes}</td>
                    <td>${row.fecha}</td>
                </tr>`;
            });
            
            html += '</table><br><a href="/" style="color: #b76e79;">← Volver</a></body></html>';
            res.send(html);
        }
    });
});

app.get('/api/confirmaciones', (req, res) => {
    db.all('SELECT * FROM confirmaciones ORDER BY fecha DESC', [], (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor corriendo en puerto ${port}`);
});