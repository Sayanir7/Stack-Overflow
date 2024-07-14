document.addEventListener('DOMContentLoaded',()=>{
    const btn=document.querySelector('.user-icon');
    const menu=document.querySelector('.dropdown-menu');
    const drop_icon=document.querySelector('.drop-icon')
    btn.addEventListener('click',()=>{
        if(menu.classList.contains('show')){
            menu.classList.remove('show');
            drop_icon.classList.remove('show');
            
        }
        else{
            menu.classList.add('show');
            drop_icon.classList.add('show');

        }
        
        
    });

   
});