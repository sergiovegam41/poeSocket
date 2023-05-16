const socket = io()

window.addEventListener("DOMContentLoaded", (event) => {
   

socket.on('server:init',(data)=>{
    console.log(data.success)
    console.log("init data")

   if(data.success){
    document.getElementById("body").innerHTML = `
    <div id="form">


    <h1>Anthropic</h1>

     <input type="text"  id="mensage" cols="30" rows="10"></textarea>
    
    <div id="IA" >


        <div class="vanilla" >
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

     document.getElementById('loader').remove()

     document.getElementById('IA').innerHTML = `
     <div class="vanilla" >
          <p id="${data.id}" class="IAResponse">${data.message.trim()}</p>
      </div>
      ` + document.getElementById('IA').innerHTML


    socket.on(`server:newMessage:${data.id}`, (dataChid)=>{
        document.getElementById(data.id).innerText = dataChid.message.trim()
    })



    // document.getElementById('IAResponse').innerText = data.message

})

});

async function send(){
    console.log("send")

   let message = document.getElementById('mensage').value
   socket.emit( "client:send", {message: message} )
   document.getElementById('mensage').value = ""

   document.getElementById('IA').innerHTML = `
   <div class="vanilla human" >
        <p id="HumanResponse" class="HumanResponse">${message}</p>
    </div>
    ` + document.getElementById('IA').innerHTML

    document.getElementById('IA').innerHTML = `
        <div id="loader" class="vanilla" >
             <p id="IAResponse" class="IAResponse"> <span  class="loader"></span></p>
        </div>
    ` + document.getElementById('IA').innerHTML

//   console.log(data)
}


document.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) { 
      send();  
    }
  });
  

