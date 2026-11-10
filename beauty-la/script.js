(function(){
  var b=document.querySelector('.menu-toggle'), n=document.getElementById('nav');
  if(b&&n){b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Close menu':'Open menu');});}
  var y=document.querySelectorAll('.year');for(var i=0;i<y.length;i++){y[i].textContent=new Date().getFullYear();}
})();
