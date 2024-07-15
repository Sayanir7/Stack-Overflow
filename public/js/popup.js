document.addEventListener('DOMContentLoaded',()=>{
    const popup=document.querySelector('.popup');
    const pop_btn=document.querySelector('.popup-btn');
    const pop_container=document.querySelector('.pop-container');

    pop_btn.addEventListener('click',()=>{
        if(popup.classList.contains('show')){
            popup.classList.remove('show');
            pop_container.classList.remove('show');

        }
        else{
            popup.classList.add('show');
            pop_container.classList.add('show');

        }
    });
    window.addEventListener('click', (event) => {
        if (event.target == pop_container) {
            popup.classList.remove('show');
            pop_container.classList.remove('show');
        }
    });
})