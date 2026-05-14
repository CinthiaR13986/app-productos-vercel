const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const result = await pool.query(
        "SELECT * FROM productos ORDER BY id ASC"
      );

      return res.status(200).json(result.rows);
    }

    if (req.method === "POST") {
      const { nombre, descripcion, precio, stock } = req.body;

      if (!nombre || precio === undefined || stock === undefined) {
        return res.status(400).json({
          mensaje: "Nombre, precio y stock son obligatorios"
        });
      }

      const result = await pool.query(
        `INSERT INTO productos (nombre, descripcion, precio, stock)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [nombre, descripcion, precio, stock]
      );

      return res.status(201).json(result.rows[0]);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          mensaje: "El id es obligatorio"
        });
      }

      const result = await pool.query(
        "DELETE FROM productos WHERE id = $1 RETURNING *",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          mensaje: "Producto no encontrado"
        });
      }

      return res.status(200).json({
        mensaje: "Producto eliminado correctamente"
      });
    }

    return res.status(405).json({
      mensaje: "Método no permitido"
    });

  } catch (error) {
    console.error("Error en API productos:", error);

    return res.status(500).json({
      mensaje: "Error interno del servidor"
    });
  }
};
