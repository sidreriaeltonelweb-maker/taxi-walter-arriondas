const pagesBase=window.location.hostname.endsWith('.github.io')?'/taxi-walter-arriondas':'';
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

const reservationUrl='https://taxia-reservas.marioquiroscuestaspo.chatgpt.site/reservar';
const phoneUrl='tel:+34608359956';

const assistant=document.createElement('div');
assistant.className='taxi-assistant';
assistant.innerHTML=`
  <button class="assistant-toggle" type="button" aria-label="Abrir asistente de Taxi Walter" aria-expanded="false">
    <span aria-hidden="true">?</span><strong>¿Te ayudo?</strong>
  </button>
  <section class="assistant-panel" role="dialog" aria-label="Asistente de Taxi Walter" hidden>
    <header class="assistant-header">
      <div><strong>Asistente de Taxi Walter</strong><small>Respuestas inmediatas</small></div>
      <button class="assistant-close" type="button" aria-label="Cerrar asistente">×</button>
    </header>
    <div class="assistant-messages" aria-live="polite"></div>
    <div class="assistant-quick" aria-label="Preguntas frecuentes"></div>
    <form class="assistant-form">
      <label class="sr-only" for="assistant-question">Escribe tu pregunta</label>
      <input id="assistant-question" name="question" autocomplete="off" maxlength="240" placeholder="Escribe tu duda…" required>
      <button type="submit" aria-label="Enviar pregunta">Enviar</button>
    </form>
    <p class="assistant-note">Este asistente informa, pero no confirma precios ni disponibilidad.</p>
  </section>`;
document.body.append(assistant);

const toggle=assistant.querySelector('.assistant-toggle');
const panel=assistant.querySelector('.assistant-panel');
const closeButton=assistant.querySelector('.assistant-close');
const messages=assistant.querySelector('.assistant-messages');
const quick=assistant.querySelector('.assistant-quick');
const assistantForm=assistant.querySelector('.assistant-form');
const assistantInput=assistant.querySelector('#assistant-question');
const quickQuestions=['¿Cómo reservo?','¿Cuánto cuesta?','¿Admitís mascotas?','Excursiones'];

function addAssistantMessage(text,owner='bot',actions=[]){
  const bubble=document.createElement('div');
  bubble.className=`assistant-message ${owner}`;
  const copy=document.createElement('p');
  copy.textContent=text;
  bubble.append(copy);
  if(actions.length){
    const links=document.createElement('div');
    links.className='assistant-actions';
    actions.forEach(action=>{
      const link=document.createElement('a');
      link.href=action.href;
      link.textContent=action.label;
      if(action.external){link.target='_blank';link.rel='noopener';}
      links.append(link);
    });
    bubble.append(links);
  }
  messages.append(bubble);
  messages.scrollTop=messages.scrollHeight;
}

function normalise(text){
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9ñ\s]/g,' ');
}

function assistantAnswer(question){
  const q=normalise(question);
  const has=(...words)=>words.some(word=>q.includes(word));

  if(has('112','accidente','emergencia','urgencia medica'))return {text:'Si se trata de una emergencia, llama directamente al 112. Para un viaje urgente, llama a Walter para comprobar si está disponible.',actions:[{label:'Llamar a Walter',href:phoneUrl}]};
  if(has('hola','buenos dias','buenas tardes','buenas noches'))return {text:'¡Hola! Soy el asistente de Taxi Walter. Puedo ayudarte con reservas, tarifas orientativas, servicios, excursiones y formas de pago.'};
  if(has('reserv','pedir taxi','solicitar taxi','disponib','libre'))return {text:'Puedes enviar una solicitud desde el formulario de reservas. Indica origen, destino, fecha y hora. La reserva queda pendiente hasta que Walter confirme disponibilidad y precio.',actions:[{label:'Reservar online',href:reservationUrl,external:true},{label:'Llamar',href:phoneUrl}]};
  if(has('precio','cuanto','cuesta','tarifa','km','kilometro'))return {text:'La referencia publicada es 0,65 €/km calculando ida y vuelta, 18 €/hora de espera y un 20 % adicional de 22:00 a 06:00. Es orientativa: Walter confirma el precio final antes del servicio.',actions:[{label:'Ver tarifas',href:`${pagesBase}/tarifa.html`},{label:'Pedir reserva',href:reservationUrl,external:true}]};
  if(has('mascota','perro','gato','animal'))return {text:'Sí, las mascotas son bienvenidas. Indica en la reserva qué animal viaja y si lleva transportín para preparar el servicio.',actions:[{label:'Reservar con mascota',href:reservationUrl,external:true}]};
  if(has('pago','tarjeta','bizum','efectivo'))return {text:'Puedes pagar en efectivo, con tarjeta o mediante Bizum. Si necesitas factura, indícalo al solicitar el viaje.'};
  if(has('pasajer','personas','plazas','capacidad','grupo'))return {text:'El vehículo admite hasta 4 pasajeros. Para grupos mayores, llama antes para consultar alternativas.',actions:[{label:'Llamar',href:phoneUrl}]};
  if(has('maleta','equipaje','silla de bebe','bebe','movilidad','ruedas'))return {text:'Indica el equipaje, silla infantil o necesidad de movilidad en las observaciones de la reserva. Walter confirmará si el vehículo está preparado para ese servicio.',actions:[{label:'Añadirlo a la reserva',href:reservationUrl,external:true}]};
  if(has('aeropuerto','avion','estacion','tren','bus','autobus'))return {text:'Taxi Walter realiza traslados a aeropuertos y estaciones. Reserva con antelación e incluye la hora de salida o llegada y, si lo tienes, el número de vuelo o tren.',actions:[{label:'Solicitar traslado',href:reservationUrl,external:true}]};
  if(has('covadonga','lagos'))return {text:'Hay servicio a los Lagos de Covadonga con recogida acordada e ida y vuelta. Los accesos pueden estar regulados según la fecha, por lo que horario, precio y disponibilidad se confirman al reservar.',actions:[{label:'Ver Lagos de Covadonga',href:`${pagesBase}/covadonga.html`},{label:'Reservar',href:reservationUrl,external:true}]};
  if(has('cares','senderismo','ruta'))return {text:'Para la Ruta del Cares se puede coordinar el traslado al inicio y la recogida al finalizar. El punto y la hora exactos se confirman con Walter.',actions:[{label:'Ver Ruta del Cares',href:`${pagesBase}/cares.html`},{label:'Reservar',href:reservationUrl,external:true}]};
  if(has('excursion','visita','turismo','asturias'))return {text:'Se realizan excursiones por Asturias, incluidos Lagos de Covadonga y Ruta del Cares, y también trayectos personalizados. Cuéntanos el destino y Walter confirmará horario y precio.',actions:[{label:'Ver excursiones',href:`${pagesBase}/excursiones.html`},{label:'Solicitar excursión',href:reservationUrl,external:true}]};
  if(has('donde','direccion','ubicacion','parada','arriondas','recoger'))return {text:'La parada está en la calle Nicanor Piñole, Arriondas. También pueden recogerte en la dirección que indiques. El servicio cubre Asturias y viajes de larga distancia.'};
  if(has('hora','horario','noche','madrugada','24 horas','24h'))return {text:'Se aceptan reservas anticipadas para cualquier horario. La disponibilidad concreta, especialmente de noche o para servicios inmediatos, debe confirmarla Walter.',actions:[{label:'Solicitar reserva',href:reservationUrl,external:true},{label:'Llamar ahora',href:phoneUrl}]};
  if(has('cancel','cambiar','modificar','retraso','tarde'))return {text:'Para modificar o cancelar una solicitud ya enviada, llama directamente a Walter al 608 359 956 para que pueda localizarla y confirmar el cambio.',actions:[{label:'Llamar',href:phoneUrl}]};
  if(has('telefono','contacto','llamar','whatsapp','walter'))return {text:'Puedes contactar con Walter en el 608 359 956. Para una reserva no urgente, también puedes usar el formulario online.',actions:[{label:'Llamar',href:phoneUrl},{label:'Reservar online',href:reservationUrl,external:true}]};
  return {text:'No tengo una respuesta segura para esa consulta y prefiero no inventarla. Puedes incluir la pregunta en una solicitud de reserva o llamar a Walter al 608 359 956.',actions:[{label:'Abrir reservas',href:reservationUrl,external:true},{label:'Llamar a Walter',href:phoneUrl}]};
}

function askAssistant(question){
  const clean=question.trim();
  if(!clean)return;
  addAssistantMessage(clean,'user');
  const answer=assistantAnswer(clean);
  window.setTimeout(()=>addAssistantMessage(answer.text,'bot',answer.actions||[]),180);
}

quickQuestions.forEach(question=>{
  const button=document.createElement('button');
  button.type='button';
  button.textContent=question;
  button.addEventListener('click',()=>askAssistant(question));
  quick.append(button);
});

function setAssistantOpen(open){
  panel.hidden=!open;
  toggle.setAttribute('aria-expanded',String(open));
  assistant.classList.toggle('open',open);
  if(open)assistantInput.focus();
}

toggle.addEventListener('click',()=>setAssistantOpen(panel.hidden));
closeButton.addEventListener('click',()=>setAssistantOpen(false));
assistantForm.addEventListener('submit',event=>{
  event.preventDefault();
  askAssistant(assistantInput.value);
  assistantInput.value='';
  assistantInput.focus();
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!panel.hidden)setAssistantOpen(false);
});

addAssistantMessage('¡Hola! Soy el asistente virtual de Taxi Walter. ¿En qué puedo ayudarte?');
