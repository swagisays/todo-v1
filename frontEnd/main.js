


window.onload= function (){
    const toggleButton = document.getElementsByClassName('toggle-button') [0]
    const navlist = document.getElementsByClassName('navbar-links') [0]
    const navbar = document.getElementsByClassName('nav')[0]
    const signin = document.getElementsByClassName('login-btn')[0]
    const register = document.getElementsByClassName('register-btn')[0]
    const body = document.getElementsByClassName('body')[0]
    const auth = document.getElementsByClassName('auth')[0]
    const authlogin = document.getElementsByClassName('auth-login')[0]
    
    toggleButton.addEventListener('click',() =>{
        navlist.classList.toggle('active')
        navbar.classList.toggle('h-resp')
    })

   signin.addEventListener('click',()=>{
        body.classList.toggle('login-resp')
        authlogin.classList.toggle('dis')
    })

    register.addEventListener('click',()=>{
        body.classList.toggle('login-resp')
        auth.classList.toggle('display')
    })

 
}



