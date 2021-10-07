var mongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/peliculas";


async function main() {

    const client = new mongoClient(url);

    try {
        await client.connect();
        await demo(client);
        console.log("Peliculas iniciales");
        await viewMovies(client);
        console.log("Actualizando peliculas");
        await updateManyMovies(client);
        await viewMovies(client);
        await replaceOneMovie(client, "Capitán América");
        await viewMovies(client);
        await viewMoviesYear(client, 2012);
        await deleteFieldBoxoffice(client, "Black Panther");
        await viewMovies(client);

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main().catch(console.error);



async function demo(client) {
    const collections = await client.db('peliculas').collections();
    if (collections.map(c => c.s.namespace.collection).includes('peliculas')) {
        const delOK = await client.db('peliculas').collection('peliculas').drop();
        if (delOK) console.log("Collection deleted");
    }
    const myObj = [{
        "nombre": "Capitán América",
        "actor ": "Chris Evans",
        "estreno": 2011
    }, {
        "nombre": "Capitana Marvel",
        "actor ": "Brie Larson",
        "estreno": 2019
    }, {
        "nombre": "Iron Man",
        "actor ": "Robert Downey Jr.",
        "estreno": 2008
    }, {
        "nombre": "Hulk",
        "actor ": "Edward Norton",
        "estreno": 2008
    }, {
        "nombre": "Thor",
        "actor ": "Chris Hemsworth",
        "estreno": 2011
    }];

    await client.db('peliculas').collection('peliculas').insertMany(myObj);

    console.log('5 Peliculas fueron agregadas exitosamente');

}

async function viewMovies(client) {

    const posts = await client.db('peliculas').collection('peliculas').find().toArray()
    posts.forEach((e) => console.log(e.nombre, " fue estrenada en ", e.estreno, ' boxoffice: ', e.boxoffice))
}

async function viewMoviesYear(client, year) {
    console.log("Peliculas estrenadas antes del ", year);
    const posts = await client.db('peliculas').collection('peliculas').find({
        estreno: { $lt: year }
    }).toArray()
    posts.forEach((e) => console.log(e.nombre, " fue estrenada en ", e.estreno, ' boxoffice: ', e.boxoffice))
}

async function updateManyMovies(client) {
    const posts = await client.db('peliculas').collection('peliculas')
        .updateMany({ boxoffice: { $exists: false } }, { $set: { boxoffice: 0 } });
    console.log(`${posts.modifiedCount} peliculas fueron actualizadas.`);
}

async function replaceOneMovie(client, nombre) {
    const posts = await client.db('peliculas').collection('peliculas')
        .replaceOne({ "nombre": nombre }, { "nombre": "Black Panther", "actor": "Chadwick Boseman", "estreno": 2018, "boxoffice": 0 });
    console.log(`${posts.modifiedCount} pelicula fue reemplazada.`);
}

async function deleteFieldBoxoffice(client, nombre) {
    console.log("Se elimina el campo boxoffice de ", nombre);
    const posts = await client.db('peliculas').collection('peliculas')
        .updateOne({ "nombre": nombre }, { $unset: { "boxoffice": "" } });
    console.log(`${posts.modifiedCount} pelicula fue actualizada.`);
}