const { Pool } = require('pg');

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "Clow2508!",
    database: "joyas",
    port: 5432,
    allowExitOnIdle: true
});

const format = require('pg-format');

const getInventario = async ({ limits = 10, order_by = "id_ASC", page = 0 }) => {
    try {
        if (limits < 1 || page < 0) {
            const error = new Error('Los parámetros de entrada no son válidos');
            error.status = 400; 
            throw error;
        }

        const [campo, direccion] = order_by.split('_');
        const offset = page * limits - limits;

        const consulta = `SELECT * FROM inventario ORDER BY ${campo} ${direccion} LIMIT $1 OFFSET $2`;
        const valores = [limits, offset];

        const { rows: inventario } = await pool.query(consulta, valores);
        return inventario;
    } catch (error) {
        if (!error.status) {
            error.status = 500; 
        }
        throw error; 
    }
};

const getInventarioFiltrado = async ({ precio_max, precio_min, categoria, metal }) => {
    try {
        // Validación de los parámetros de entrada
        if (precio_max && precio_max < 0 || precio_min && precio_min < 0) {
            const error = new Error('Los parámetros de entrada no son válidos');
            error.status = 400; 
            throw error;
        }

        let filtros = [];
        const values = [];
        const AgregarFiltro = (campo, comparador, valor) => {
            values.push(valor);
            const length = values.length;
            filtros.push(`${campo} ${comparador} $${length}`);
        }

        if (precio_max) AgregarFiltro(`precio`, `<=`, precio_max);
        if (precio_min) AgregarFiltro(`precio`, `>=`, precio_min);
        if (categoria) AgregarFiltro(`categoria`, `=`, categoria);
        if (metal) AgregarFiltro(`metal`, `=`, metal);

        let consulta = `SELECT * FROM inventario`;

        if (filtros.length > 0) {
            consulta += ` WHERE ${filtros.join(' AND ')}`;
        }

        const formattedQuery = {
            text: consulta,
            values: values
        };

        const { rows: inventario } = await pool.query(formattedQuery);
        return inventario;
    } catch (error) {
        if (!error.status) {
            error.status = 500; 
        }
        throw error;
    }
};


const prepararHATEOAS = (inventario) => {
    const results = inventario.map((joya) => {
        return {
            name: joya.nombre,
            href: `/joyas/joyas/${joya.id}`
        };
    }).slice(0, 4);
    const total = inventario.length;
    const HATEOAS = {
        total,
        results
    };
    return HATEOAS;
};

const verificador = (req, res, next) => {
    const fechaConsulta = new Date();
    const dia = fechaConsulta.getDate();
    const mes = fechaConsulta.getMonth() + 1;
    const año = fechaConsulta.getFullYear();

    const fechaFormateada = `${dia}/${mes}/${año}`;

    console.log(`Solicitud ${req.method} a la ruta ${req.path} recibida el ${fechaFormateada}.`);

   
    res.on('finish', () => {
        if (res.statusCode === 200) {
            console.log(`¡La consulta a la ruta ${req.path} fue exitosa el ${fechaFormateada}! ¡Buen trabajo!`);
        } else {
            console.log(`La consulta falló el ${fechaFormateada}.`);
        }
    });

    next();
};


module.exports = { getInventario, prepararHATEOAS, getInventarioFiltrado, verificador };