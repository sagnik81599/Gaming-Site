// menu bar

const navbarMenu = document.querySelector(".navbar .links");
const hamburgerBtn = document.querySelector(".hamburger-btn");
const hideMenuBtn = navbarMenu.querySelector(".close-btn");
const showPopupBtn = document.querySelector(".login-btn");
const formPopup = document.querySelector(".form-popup");
const hidePopupBtn = formPopup.querySelector(".close-btn");
const signupLoginLink = formPopup.querySelectorAll(".bottom-link a");

// Show mobile menu
hamburgerBtn.addEventListener("click", () => {
    navbarMenu.classList.toggle("show-menu");
});

// Hide mobile menu
hideMenuBtn.addEventListener("click", () =>  hamburgerBtn.click());

// Show login popup
showPopupBtn.addEventListener("click", () => {
    document.body.classList.toggle("show-popup");
});

// Hide login popup
hidePopupBtn.addEventListener("click", () => showPopupBtn.click());

// Show or hide signup form
signupLoginLink.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        formPopup.classList[link.id === 'signup-link' ? 'add' : 'remove']("show-signup");
    });
});



	
		//sticky navbar
		window.addEventListener('scroll',function(){
            var header = document.querySelector('header');
            header.classList.toggle('sticky',window.scrollY > 0)
           });


           function mobile(){
            alert("Working Guys, Stay Tuned")
           }


           
// card js popular game

let list = document.querySelectorAll('.list');
     let card = document.querySelectorAll('.card');

   for(let i=0; i<list.length; i++){
       list[i].addEventListener('click',function(){
           for(let j=0;j<list.length;j++){
              list[j].classList.remove('active');
          }
          this.classList.add('active');

         let dataFilter = this.getAttribute('data-filter'); 

         for(let k=0;k<card.length;k++)
            {
             card[k].classList.remove('active');
             card[k].classList.add('hide');

             if(card[k].getAttribute('data-items') == dataFilter || dataFilter == 'all'){
                card[k].classList.remove('hide');
                card[k].classList.add('active');           
            }

           }
    })
 }
