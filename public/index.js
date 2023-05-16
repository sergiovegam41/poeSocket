const socket = io()

window.addEventListener("DOMContentLoaded", (event) => {
   

socket.on('server:init',(data)=>{
    console.log(data.success)
    console.log("init data")

   if(data.success){
    document.getElementById("body").innerHTML = `

    <script src="vanilla.js"></script>
    <div id="form">


            <h1>Anthropic</h1>
        
             <input type="text" name="mensage" id="mensage" cols="30" rows="10"></textarea>
            
            <div id="IA" >
                <div class="vanilla" data-tilt-max-glare="0.8" data-tilt data-tilt-reverse="true" >
                    <p id="IAResponse" class="IAResponse">Escribe algo para empezar 😁</p>
                </div>
            </div>

            
        </div>


    `;
   }else{
    document.getElementById("body").innerHTML = `:(`
   }


})

socket.on('server:newMessage',(data)=>{


    socket.on(`server:newMessage:${data.id}`, (dataChid)=>{

        // console.log( dataChid.message )
        document.getElementById('IAResponse').innerText = dataChid.message.trim().replace(/\n/g,'')


    })



    document.getElementById('IAResponse').innerText = data.message

})

});

async function send(){
    console.log("send")

   let message = document.getElementById('mensage').value
   socket.emit( "client:send", {message: message} )
   document.getElementById('mensage').value = ""

   document.getElementById('IAResponse').innerHTML = '<span class="loader"></span>'

//   console.log(data)
}

document.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { 
      send();  
    }
  });
  

