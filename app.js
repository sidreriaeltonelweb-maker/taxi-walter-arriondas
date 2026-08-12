const pagesBase='/taxi-walter-arriondas';
const internalRoutes={
  '/':`${pagesBase}/`,
  '/excursiones':`${pagesBase}/excursiones.html`,
  '/tarifa':`${pagesBase}/tarifa.html`,
  '/covadonga':`${pagesBase}/covadonga.html`,
  '/cares':`${pagesBase}/cares.html`,
  '/#servicios':`${pagesBase}/#servicios`,
};

document.querySelectorAll('a[href^="/"]').forEach(link=>{
  const href=link.getAttribute('href');
  if(internalRoutes[href]) link.setAttribute('href',internalRoutes[href]);
});

const siteUrl=`${window.location.origin}${pagesBase}`;
document.querySelectorAll('link[rel="canonical"]').forEach(link=>{
  const file=window.location.pathname.endsWith('/')?'':window.location.pathname.split('/').pop();
  link.setAttribute('href',`${siteUrl}/${file}`);
});
document.querySelectorAll('meta[property="og:url"]').forEach(meta=>meta.setAttribute('content',`${siteUrl}/`));
document.querySelectorAll('meta[property="og:image"]').forEach(meta=>meta.setAttribute('content',`${siteUrl}/Imagenes/hero-taxi-animado-rotulado.png`));

const menuButton=document.querySelector('.menu-btn');
const navLinks=document.querySelector('.nav-links');
menuButton?.addEventListener('click',()=>{
  const open=navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded',String(open));
});
document.querySelectorAll('.nav-links a').forEach(link=>link.addEventListener('click',()=>navLinks?.classList.remove('open')));

const calculator=document.querySelector('#fare-calculator');
calculator?.addEventListener('submit',event=>{
  event.preventDefault();
  const km=Math.max(0,Number(calculator.km.value)||0);
  const wait=Math.max(0,Number(calculator.espera.value)||0);
  const night=calculator.horario.value==='noche';
  const estimate=(km*0.65*2+wait*18)*(night?1.2:1);
  document.querySelector('#resultado').textContent=`Estimación orientativa: ${estimate.toLocaleString('es-ES',{style:'currency',currency:'EUR'})}`;
});
