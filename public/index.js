const socket = io()

socket.on('server:init',(data)=>{
    console.log(data.success)
    console.log("init data")

   if(data.success){
    document.getElementById("body").innerHTML = `

    <div id="form">

        <h1>Anthropic</h1>
    
         <input type="text" name="mensage" id="mensage" cols="30" rows="10"></textarea>
        
        <div id="IA">
            <p id="IAResponse">  </p>
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
        document.getElementById('IAResponse').innerText = dataChid.message


    })



    document.getElementById('IAResponse').innerText = data.message

})

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
  

