<script lang="ts">
    import { io } from "socket.io-client";
    import { fade } from "svelte/transition";

    let myId = $state(Math.random())

    const socket = io('https://test-slxi.onrender.com',{
        auth:{
            userId: myId,
        },
        transports: ["websocket"]
    })
  
   let message = $state('')
   let isMessageSet = $state(false)
   let timer: string | number | NodeJS.Timeout | undefined;
   let messages = $state([])

   let textMessage = $state('')
   let isTyping = $state(false)
   let roomId = 'global-room'

  $effect(()=>{
    socket.emit('join-chat', roomId)

    socket.on('chat-joined', id =>{
       isMessageSet = true;
       message = 'new User Joined with: '+ id

       timer = setInterval(()=>{
        isMessageSet = false;
        }, 1000)

       console.log('new user')
    })

    let typeInterval: string | number | NodeJS.Timeout | undefined;
    socket.on('typing', ()=>{
        isTyping = true

    typeInterval = setInterval(()=>{
        isTyping = false
    }, 3000)

    })


    socket.on('new-message', (message)=>{
        console.log(message)
        messages.push(message)
    })

    return ()=>{
        clearInterval(timer)
        clearInterval(typeInterval)
    }

  })


  function sendMessage(e: any){
    e.preventDefault()

    socket.emit('send-message', textMessage, roomId)
    textMessage = ''
  }

  

  function handleTyping(){
    socket.emit('typing', roomId)
  }



</script>



<main class="h-[100vh] flex flex-col justify-between items-center">
    
    {#if isMessageSet === true}
    <div class="absolute text-[12px] text-center bg-white rounded-2xl top-15 w-[50%] p-2 z-10 shadow-2xl" transition:fade >
        {message}
    </div>
    {/if}

    <header class="flex items-center w-full justify-between p-2">
        <h1 class="font-semibold text-[16px]">Global Chat.</h1>
        <div class="flex items-center gap-1 px-1 bg-amber-200 rounded-full">
            <img class="p-[1px] w-[20px] h-[20px] bg-amber-50 rounded-full" src="/favicon.png" alt="">
            <span class="text-[14px] font-semibold">Neza</span>
        </div>
    </header>
    <div class="chat-messages flex flex-col w-full h-full bg-amber-100 overflow-y-auto p-2">
       {#each messages as message }
       <div class="chat-message flex flex-col items-start gap-1" >
        <div class="chat-user-info-with-date flex items-center gap-2">
            <div class="flex gap-1 items-center bg-amber-200 px-1 rounded-2xl">
                <img class="w-[20px] h-[20px] bg-amber-50 rounded-full" src="/favicon.png" alt="">
                <span class="font-semibold text-[14px]">User-</span>
            </div>
            <div class="text-[12px]">12:00 AM</div>
        </div>
        <p class="content p-2 bg-[#f1f1f1f1] rounded-b-2xl rounded-tr-2xl ">{message}</p>
    </div>
    <!-- <div class="my-chat-message flex flex-col items-end">
        <div class="chat-user-info-with-date flex items-center gap-2">
            
            <div class="text-[12px]">12:00 AM</div>
            <div class="flex gap-1 items-center bg-amber-200 px-1 rounded-2xl">
                <span class="font-semibold text-[14px]">seen</span>
            </div>
        </div>
        <p class="content p-2 bg-[#f1f1f1f1] rounded-b-2xl rounded-tl-2xl ">Hello from me!</p>
    </div> -->
       {/each}
    </div>

    {#if isTyping}
    <p class="absolute bottom-10 left-0 px-2 z-10 ">Typing...</p>
   {/if}
   

    <form onsubmit={sendMessage} class="message-content flex items-center justify-between w-full relative ">
        <input bind:value={textMessage} onkeyup={handleTyping} type="text" placeholder="Wtite a message!" class="w-full outline-none border-[1px] border-amber-50  ">
        <button class="p-2 text-[12px] bg-[dodgerblue] h-full text-white">Send</button>
    </form>
</main>