const express = require('express')
const fs = require('fs')
const handlebars = require("express-handlebars")
const {Server: HttpServer} = require("http")
const {Server: IOServer} = require("socket.io")
const {faker} = require("@faker-js/faker")

const app = express()
app.use(express.json)
app.use(express.static("public"))
app.set("views", "./views")
app.set("view engine", "hbs")
app.engine(
    "hbs",
    engine({
        extname: ".hbs",
        defaultLayout: "index.hbs",
        layoutsDir: __dirname+"/views/layouts",
        partialsDir: __dirname+"/views/partials"
    })
)
app.use( express.urlencoded({extended: false}) )


const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

const PORT = 8080
const db = fs.readFileSync('productos.json')

const server = app.listen(PORT, () => {

} )

app.get("/productos", (req, res)=> {
    res.render("main", {
        db, form: false
    })
})

app.get("/", (req, res)=> {
    res.render("main", {
        db, form: true
    })
})

app.post("/productos", (req, res)=> {
    const { body } = req
    db.push(body)
    res.render("main", {
        db, form: true
    })

    res.send(db)
})

// ? Faker

app.get("/api/productos-test", (req, res) => {
    let msgFaker = {}
    for (let index = 0; index < 4; index++) {
        msgFaker.push({
            author: {
                id: index,
                nombre: faker.name.findName(),
                apellido: faker.name.lastName(),
                edad: faker.random.number({ max: 100 }),
                alias: faker.random.words(2),
                avatar: faker.image.avatar(),
            },
            text: faker.lorem.lines()
        })
        
    }
    res.send(msgFaker)
})


 // ? Chat

let mensajesDB = []

io.on("connection", socket => {
    console.log("SocketIO Connected!");
    const messages = JSON.parse(fs.readFileSync("mensajes.json", utf));
    mensajesDB = messages;
    socket.emit("initial", messages);
    socket.on("sendMessage", (data) => {
        data.timestamp = (new Date).toLocaleString();
        mensajesDB.push(data);
        io.sockets.emit("shareMessages", mensajesDB);
        fs.writeFileSync("mensajes.json", JSON.stringify(mensajesDB), utf);
    });
})

server.listen(PORT, () => {})