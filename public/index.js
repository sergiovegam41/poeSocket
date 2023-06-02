const socket = io()

window.addEventListener("DOMContentLoaded", (event) => {
    
console.log("Sieee")

socket.on('server:init',(data)=>{
    console.log("init data")
    console.log(data.success)
    
    console.log("Sieee")
   if(data.success){

    document.getElementById("body").innerHTML = `

    <div id="form">
        
        <h1>Anthropic</h1>
        
        <textarea   rows="1" oninput="expandTextArea()"  type="text"  id="mensage"  placeholder="Send a message."></textarea>
        
        <div id="IA" >
            
        </div>
        
    </div>

    `;


  

   }else{
    document.getElementById("body").innerHTML = `:(`
   }



})

socket.on('server:endMessage',(data)=>{

    document.getElementById('mensage').readOnly  = false;
})

socket.on('server:newMessage',(data)=>{



     document.getElementById('loader').remove()

     document.getElementById('IA').innerHTML = `
     <div class="vanilla n-e-wnew-n-e-w" >
          <p id="${data.id}" class="IAResponse">${data.message.trim()}</p>
      </div>
      ` + document.getElementById('IA').innerHTML.replace("n-e-wnew-n-e-w","")


    socket.on(`server:newMessage:${data.id}`, (dataChid)=>{
        document.getElementById(data.id).innerText = dataChid.message.trim()
    })



    // document.getElementById('IAResponse').innerText = data.message

})



});

async function send(){
    console.log("send")
    document.getElementById('mensage').placeholder  = "Send a message.";
    document.getElementById('mensage').readOnly  = true;

   let message = document.getElementById('mensage').value
   socket.emit( "client:send", {message: message} )
   document.getElementById('mensage').value = ""

   document.getElementById('IA').innerHTML = `
   <div class="vanilla human n-e-wnew-n-e-w" >
        <p id="HumanResponse" class="HumanResponse">${message}</p>
    </div>
    ` + document.getElementById('IA').innerHTML.replace("n-e-wnew-n-e-w","")

    document.getElementById('IA').innerHTML = `
        <div id="loader" class="" >
             <p id="IAResponse" class="IAResponse"> <span  class="loader"></span></p>
        </div>
    ` + document.getElementById('IA').innerHTML

//   console.log(data)
}


document.addEventListener("keydown", function(event) {
    if (event.keyCode === 13 && document.getElementById('mensage').value && event.shiftKey!=1) { 
        document.getElementById('mensage').rows = 1
        send();  
      
    }
});
  



function expandTextArea() {
    console.log("Hola")

    if(document.getElementById('mensage').value.endsWith("\n")) {
        document.getElementById('mensage').value.trimRight("\n");
    }
        

    let rows = document.getElementById('mensage').value.split("\n").length ;
    console.log(rows)

    if( rows > 1){
        
        document.getElementById('mensage').rows = rows
    }

    if( rows <= 1){

        document.getElementById('mensage').rows = 1

    }
} 