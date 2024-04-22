const express = require('express')
const app = express()

const { getInventario, prepararHATEOAS,getInventarioFiltrado,verificador  } = require('./consultas');



app.get('/prueba', (req, res) => {
    res.send('Hola Mundo')
})

app.get('/joyas', verificador, async (req, res) => {
    const queryStrings = req.query;
    const inventario = await getInventario(queryStrings);
    const HATEOAS = prepararHATEOAS(inventario);
    res.json(HATEOAS); 
});

app.get('/joyas/filtros', verificador, async (req, res) => {
    const queryStrings = req.query;
    const inventario = await getInventarioFiltrado(queryStrings);
    res.json(inventario); 
});

app.get(`*`, (req, res) => res.send(`Ruta no encontrada`));

app.listen(3000, () => console.log('Server ON'));