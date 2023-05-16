// var botsdata = 
const poe = require('./poe-client');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
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

test();

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


        bot = "botego";
        console.log("new conection")
        token = "QUTb7C8INEScs82y8QL3hA%3D%3D"

        var clientPoe = new poe.Client();

        await clientPoe.init(token, null, null, bot);
        let botsAny = clientPoe.bots

        await clientPoe.purge_conversation(bot, -1);
        console.log("instans created")


        socket.emit("server:init",{success:true})



        socket.on('client:send',  async ( data ) => {
            console.log("on message")
            
            try {
                var clientPoe = new poe.Client();

                
                await clientPoe.init(token,null,botsAny);

                console.log("instans created")
        

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
    
                    // console.log("###")
                    // console.log(mes.id)
                    // console.log("----")
                    // console.log(mes.text)
                    // console.log("###")
                    // reply = mes.text;
                }

                await socket.emit(`server:endMessage`,reply)
        
                return reply

            } catch (error) {
                socket.emit("server:init",{success:false})
            }
           
    
        })
        

    });

    
    server.listen(port,() => {

        console.log(`La aplicación está corriendo en el puerto: ${port}`);

        

    });

    
}


async function hasAuthority(token){
    let token_acces = '1224'
    return !(token_acces != token && token_acces != null)
}





async function sendToApi(host, body, action = 'send') {
    // console.log("Run sendMessageToApi")
    // console.log(body)
    try {
      const response = await axios.post(`${host}/${action}`, body);
      // console.log(response.data)
  
      return response.data;
  
    } catch (error) {
      throw error;
    }
  }
  
  async function selectRamDomHostAvailable() {
    const activeHosts = await ApisPoeClientAvailableCollection.find({ active: true }).toArray();
    const randomHost = activeHosts[Math.floor(Math.random() * activeHosts.length)];
    return randomHost;
  }
  
  
  async function pingToPoeClients() {
    const activeHosts = await ApisPoeClientAvailableCollection.find({ active: true }).toArray();
  
    for (let host of activeHosts) {
      try {
        let resp = await axios.get(`${host.host}/ping`);
        console.log(resp.data);
      } catch (error) {
        console.log(false);
      }
    }
  
    return true;
  }
  
  async function searchOrCreateUserByPhone(phone) {
    const user = await UsersCollection.findOne({ phone });
    if (!user) {
      const newUser = {
        phone,
        poeToken: await getTokenPoe()
      };
      await UsersCollection.insertOne(newUser);
      return await UsersCollection.findOne({ phone });
    }
    return user;
  }
  
  async function getTokenPoe() {
    let token = await poeTokensAvailableCollection.findOne();
    console.log(token.token)
    await poeTokensAvailableCollection.deleteOne({ _id: token._id });
    return token.token;
  }
  
   function getMinutesSinceLastTime (lastTime) {
    const now = new Date();
    if (!lastTime) {
      lastTime = now;
      return 0;
    } else {
      const diff = (now - lastTime) / 1000 / 60;
      lastTime = now;
      return Math.floor(diff);
    }
  }