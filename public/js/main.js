window.onload= function (){
    const toggleButton = document.getElementsByClassName('toggle-button') [0]
    const navlist = document.getElementsByClassName('navbar-links') [0]
    const navbar = document.getElementsByClassName('nav')[0]
    const signin = document.getElementsByClassName('login-btn')[0]
    const register = document.getElementsByClassName('register-btn')[0]
    const body = document.getElementsByClassName('body')[0]
    const auth = document.getElementsByClassName('auth')[0]
    const authlogin = document.getElementsByClassName('auth-login')[0]
    const closebutton = document.getElementsByClassName('close-btn')[0]
    const closebuttonLi = document.getElementsByClassName('close-btn-login')[0]
    const authbutton = document.getElementsByClassName('auth-btn')[0]
    const authregister = document.getElementsByClassName('auth-reg')[0]

    toggleButton.addEventListener('click',() =>{
        navlist.classList.toggle('active')
        navbar.classList.toggle('h-resp')
    })



    signin.addEventListener('click', login);
    register.addEventListener('click', reg);


    function login() {

        body.classList.toggle('login-resp')
        authlogin.classList.toggle('dis') 
        rm()       
    }
    
    function reg() {
        body.classList.toggle('login-resp')
        auth.classList.toggle('display')
        rm()        
    }

    function rm() {

        register.removeEventListener('click',reg);
        signin.removeEventListener('click',login);
        
    }

    closebutton.addEventListener('click',swagi);

    function swagi() {
        body.classList.toggle('login-resp');
        auth.classList.toggle('display');

        signin.addEventListener('click', login);
        register.addEventListener('click', reg);

    }

    closebuttonLi.addEventListener('click',swagi2);

    function swagi2() {
        body.classList.toggle('login-resp');
        authlogin.classList.toggle('dis');

        signin.addEventListener('click', login);
        register.addEventListener('click', reg);

    }
    authbutton.addEventListener('click',swichlogin);

    function swichlogin() 
   { swagi();
    login();
        
    }
    authregister.addEventListener('click',swichreg);

    function  swichreg() {
        swagi2();
        reg();
        
    }



    // closebutton.addEventListener('click',()=>{
    //     body.classList.toggle('login-resp')
    //     auth.classList.toggle('display')
    // })

    // closebuttonLi.addEventListener('click',()=>{
    //     body.classList.toggle('login-resp')
    //     authlogin.classList.toggle('dis')
    // })
 
}



