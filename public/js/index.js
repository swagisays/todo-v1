
window.onload= function (){
    const toggleButton = document.getElementsByClassName('toggle-button') [0]
    const sidenav = document.getElementsByClassName('side-nav')[0]
    const navresp = document.getElementsByClassName('nav-resp')[0]
    const divcal = document.getElementsByClassName('div-cal')[0]
    const divtask = document.getElementsByClassName('div-task')[0]
    const todo = document.getElementsByClassName('todo')[0]
    const des = document.getElementsByClassName('des')[0]
    const cust = document.getElementsByClassName('customLi')[0]
    const creatListBtn = document.getElementsByClassName('list-btn')[0]
    const mainBox = document.getElementsByClassName('main-box')[0]
    const home = document.getElementsByClassName('home')[0]
    const rightDiv = document.getElementsByClassName("div-task")[0]
    const leftDiv = document.getElementsByClassName("div-cal")[0]
    const taskcalbtn = document.getElementsByClassName("task-cal-btn")[0]
    
    
    
    
    creatListBtn.addEventListener('click',() => {
      cust.classList.toggle('custAct')      
      home.classList.toggle('home-o')
      leftDiv.classList.toggle('mainDiv-o')
      rightDiv.classList.toggle('mainDiv-o')
      taskcalbtn.classList.toggle('mainDiv-o')
    })
  
    
    function rm() {
      mainBox.removeEventListener('click', ()=>{
        cust.classList.toggle('custAct')        
         home.classList.toggle('home-o')
      })
      
    }
    
    
    toggleButton.addEventListener('click',() =>{
      sidenav.classList.toggle('active')
      navresp.classList.toggle('dis')
    })
    
    
    todo.addEventListener('click', divtog);
    
    function divtog() {
     
      divcal.classList.toggle('des-tg')
        divtask.classList.toggle('todo-tg')  
        
    }
    
    des.addEventListener('click', divtog2);
    
    function divtog2() {
     
      divcal.classList.toggle('des-tg')
      divtask.classList.toggle('todo-tg')
      
    }
    
    
    }