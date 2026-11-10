(function(){
  var b=document.querySelector('.menu-btn'),n=document.getElementById('nav');
  if(b&&n){b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o);b.setAttribute('aria-label',o?'Close menu':'Open menu');});}
  var chips=document.querySelectorAll('.chip[data-f]');
  chips.forEach(function(c){c.addEventListener('click',function(){
    var f=c.getAttribute('data-f');
    chips.forEach(function(x){x.setAttribute('aria-pressed',x===c?'true':'false');});
    document.querySelectorAll('.gallery figure').forEach(function(fig){fig.hidden=!(f==='all'||fig.getAttribute('data-t')===f);});
  });});
})();
