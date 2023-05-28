// var botsdata = 
const poe = require('./poe-client');
require('dotenv').config()
// const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectID = require('mongodb').ObjectID;
const express = require('express')
const app = express()
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());


const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));



const cors = require('cors');
const { emit } = require('process');

const corsOptions = {
  origin: '*', // dominio permitido
  methods: ['GET', 'POST', 'PUT'] // métodos HTTP permitidos
};

app.use(cors(corsOptions)); 

const port = process.env.PORT || 3000
const TOKEN_POE = process.env.POE_TOKEN

const { MongoClient, ServerApiVersion } = require('mongodb');
const DATABASE = process.env.MONGO_DATABASE || "Bots"
const uriMongo = process.env.MONGO_URI;
const Mongoclient = new MongoClient(uriMongo, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
var ApisPoeClientAvailableCollection = null
var poeTokensAvailableCollection = null
var UsersCollection = null
var DefaultsProntsCollection = null

Mongoclient.connect(async err => {

    ApisPoeClientAvailableCollection = Mongoclient.db(DATABASE).collection("ApisPoeClientAvailable");
    poeTokensAvailableCollection = Mongoclient.db(DATABASE).collection("poeTokensAvailable");
    UsersCollection = Mongoclient.db(DATABASE).collection("IAUsers");
    DefaultsProntsCollection = Mongoclient.db(DATABASE).collection("DefaultsPronts");
  
    if (err) { console.log(err) } else {
      this.ready = true
    }
  
    console.log("Mongo Conectado a: " + DATABASE);
    test();

  
    // const server = app.listen(port, () => {
  
    //   console.log(`La aplicación está corriendo en el puerto: ${port}`);
    //   // console.log(`Api ready.`)
    // })
  
  });


async function test() {

    app.get('/ping', async function(req, res) {
        res.send(true)    
    })

    app.post('/get-history', async function(req, res) {

       let poeToken = req.body.poeToken||TOKEN_POE

        let token = req.body.token||""
        let bot = req.body.bot||"a2"
        bot = bot.toLowerCase()

        if(! await hasAuthority(token)) return res.send({
            success:false,
            message: "UNAUTHORIZED",
        })
        
        try {

            var client = new poe.Client();
            await client.init(poeToken);

            let data = await client.get_message_history(bot)
            
            return res.send({
                success:true,
                message: "OK",
                data
            })

        } catch (error) {
            client.disconnect_ws()
            return res.send({
                    success:false,
                    message: error,
            })
            
        }

    })

    app.post('/bot-list', async function(req, res) {

       let poeToken = req.body.poeToken||TOKEN_POE

        let token = req.body.token||""
        let bot = req.body.bot||"a2"
        bot = bot.toLowerCase()

        if(! await hasAuthority(token)) return res.send({
            success:false,
            message: "UNAUTHORIZED",
        })
        
        try {

            var client = new poe.Client();
             await client.init(poeToken);

            let data = client.get_bot_names()
            
            return res.send({
                success:true,
                message: "OK",
                data
            })

        } catch (error) {
            client.disconnect_ws()
            return res.send({
                    success:false,
                    message: error,
            })
            
        }

    })


    app.post('/purge', async function(req, res) {

        let poeToken = req.body.poeToken||TOKEN_POE
        let token = req.body.token||""
        let bot = req.body.bot||"a2"
        bot = bot.toLowerCase()

        if(! await hasAuthority(token)) return res.send({
            success:false,
            message: "UNAUTHORIZED",
        })

        try {

            var client = new poe.Client();
            await client.init(poeToken);

            await client.purge_conversation(bot, -1);
            client.disconnect_ws()
            res.send({
                success: true,
                message: "OK",
            })

        } catch (error) {
            client.disconnect_ws()
            return res.send({
                    success:false,
                    message: error,
            })
            
        }
    
    })
    
    app.post('/send', async function(req, res) {

        let poeToken = req.body.poeToken||TOKEN_POE
        let token = req.body.token||""
        let message = req.body.message||""
        let purge = req.body.purge||false
        let bot = req.body.bot||"a2"
        bot = bot.toLowerCase()



        if(! await hasAuthority(token)) return res.send({
            success:false,
            message: "UNAUTHORIZED",
        })

        if(! message) return res.send({
            success:false,
            message: "MESSAGE_IS_REQUIRED",
        })

       try {

            var client = new poe.Client();
            await client.init(poeToken);

            if(purge){
                console.log("Purgado")
                await client.purge_conversation(bot, -1);
            }
            
            let reply;
            for await (const mes of client.send_message(bot, message)) {
                reply = mes.text;
            }
            client.disconnect_ws()

            return res.send({
                success:true,
                message: "OK",
                data: {
                    message: reply.trim()
                }
            })

        } catch (error) {

            console.log(error)
            client.disconnect_ws()
            return res.send({
                success:false,
                message: error,
            })
            
        }
      
    });

    //`socket`
    io.on('connection', async ( socket ) => { 

        let bot = "a2";
        console.log("new conection")
    //    let token = "7wI28WkgKYcH5F4L7R5rNA%3D%3D"
       let token = "HGq0wTo4BUZp3PE_YudxVA%3D%3D"
    //    let token = await getTokenPoe()

        var clientPoe = new poe.Client();

        let body = await clientPoe.init(token,null,null, bot);
        // console.log(body)
        // let botsAny = clientPoe.bots;

        await clientPoe.purge_conversation(bot, -1);
        console.log("[INSTANCE_CREATED]");        

        socket.emit("server:init",{success:true})



        socket.on('client:send',  async ( data ) => {
            console.log("[TEXT]: "+data.message)

            try {
                var clientPoe = new poe.Client();
                await clientPoe.init(token,null,null, bot,body);


                let reply;
                let init = true;

                for await (const mes of clientPoe.send_message(bot, data.message)) {
                    
                    let data = {
                        
                        id: mes.id,
                        message: mes.text

                    }

                    if(init){ 
                
                       await socket.emit("server:newMessage",data)
                       init=false
                
                    }else{
                
                        await socket.emit(`server:newMessage:${mes.id}`,data)
                
                    }

                    reply = mes.text.trim()

                }

                await socket.emit(`server:endMessage`,reply)

                console.log("[RESPONSE]: "+reply)
                return reply


            } catch (error) {   
                
                console.log(error)
                socket.emit("server:init",{success:false})

            }
           
        })

        
        socket.on('disconnect',async () => {

            // await setTokenPoe(token)
            console.log('Client disconnected');
            // Realizar acciones adicionales si es necesario
        });

    });

    
    server.listen(port,() => {

        console.log(`La aplicación está corriendo en el puerto: ${port}`);

    });   
}

async function hasAuthority(token){
    let token_acces = '1224'
    return !(token_acces != token && token_acces != null)
}






async function getTokenPoe() {
    let token = await poeTokensAvailableCollection.findOne();
    console.log(`[TOKEN_TAKEN]: ${token.token}`)
    await poeTokensAvailableCollection.deleteOne({ _id: token._id });
    return token.token;
}

async function setTokenPoe(token) {
    // console.log(token)
    console.log(`[TOKEN_RETURNED]: ${token}`)
    await poeTokensAvailableCollection.insertOne({ token: token});
    return token;
}
  

