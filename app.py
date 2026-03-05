from flask import Flask, render_template, request, redirect, url_for
import sqlite3
from datetime import datetime

app = Flask(__name__)

# Crear base de datos y tabla si no existen
def init_db():
    conn = sqlite3.connect('confirmaciones.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS confirmaciones
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  nombre TEXT NOT NULL,
                  asistencia TEXT NOT NULL,
                  acompanantes INTEGER DEFAULT 0,
                  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

# Ruta principal - muestra el formulario
@app.route('/')
def index():
    return render_template('index.html')

# Ruta para procesar el formulario
@app.route('/confirmar', methods=['POST'])
def confirmar():
    if request.method == 'POST':
        nombre = request.form['nombre']
        asistencia = request.form['asistencia']
        acompanantes = request.form.get('acompanantes', 0)
        
        # Guardar en base de datos
        conn = sqlite3.connect('confirmaciones.db')
        c = conn.cursor()
        c.execute("INSERT INTO confirmaciones (nombre, asistencia, acompanantes) VALUES (?, ?, ?)",
                  (nombre, asistencia, acompanantes))
        conn.commit()
        conn.close()
        
        return render_template('confirmacion.html', nombre=nombre)
    
    return redirect(url_for('index'))

# Ruta para ver todas las confirmaciones (protegela con contraseña en un proyecto real)
@app.route('/admin')
def ver_confirmaciones():
    conn = sqlite3.connect('confirmaciones.db')
    c = conn.cursor()
    c.execute("SELECT * FROM confirmaciones ORDER BY fecha DESC")
    datos = c.fetchall()
    conn.close()
    return render_template('admin.html', confirmaciones=datos)

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)