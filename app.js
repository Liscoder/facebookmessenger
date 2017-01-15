const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')

const APP_TOKEN = 'EAADpCPysCBIBADyqEmT1GX8n1YP4qCLrHCBUFeeyHxPBUsz7N4qcfgk2QKMls8oCUejZAnMn99cfuFzeW5l54TRgo0O5AwkFa5HgYZArEBV6F0AWT9OhXtiCClKcmgk2uvLVMEmxM4ZALbgy8gCPP18rZBOmIZBgq3Qrzbpmq7mdwGHCEzbny'

var app = express()
app.use(bodyParser.json())
var PORT = process.env.PORT || 3000;

app.listen(PORT, function(){
console.log('Server listen localhost:3000')
})
app.get('/', function(req, res){
	res.send("Abriendo el puerto desde mi pc local con http://ngrok.com")
})

app.get('/webhook',function(req,res){
	if(req.query['hub.verify_token'] === 'hello_token'){
			res.send(req.query['hub.challenge'])
	}else{
		res.send('Tu no tienes acceso para entrar auqui')
	}
	res.send('Hello world!')
})

app.post('/webhook',function(req, res){
	var data = req.body
	
	if(data.object == 'page'){
		data.entry.forEach(function(pageEntry){
			pageEntry.messaging.forEach(function(messagingEvent){
				if(messagingEvent.message){
					getMessage(messagingEvent)
					
					
				}
			})
		})
	}
	res.sendStatus(200)
})

function getMessage(event){
	var senderID = event.sender.id
	var messageText = event.message.text
	evaluarMensaje(senderID, messageText)
}

function evaluarMensaje(senderID, messageText){
	var mensaje ='';

	if(isContain(messageText, 'urgente')){
		mensaje = ' Por el momento no te puedo ayudar :( , pero no te preocupes nos comunicaremos lo antes posible :) '
	}else if(isContain(messageText,'hola')) {
		mensaje = 'Hola, en que te puedo ayudar'
	}else if(isContain(messageText,'telefono')){
		mensaje = 'Claro, puedes comunicarte con nosotros a través de nuestra Banca Telefónica: (01) 311-9001 desde Lima o al 0801-00801 desde provincias.'

	}else if(isContain(messageText,'Sueldo')){
		mensaje= 'Solicita y abre tu Cuenta Sueldo llenando el formulario de solicitud que se encuentra en nuestra web. También puedes acercarte a cualquiera de nuestras Tiendas Interbank a nivel nacional, incluso a las ubicadas dentro de Plaza Vea y Vivanda, que atienden de lunes a domingo de 9:00 a.m. a 9:00 p.m. :)'

	}else if(isContain(messageText,'rob')|| isContain(massageText, 'perd')){
		mensaje = 'Comunícate de inmediato a nuestra Banca Telefónica al (01) 311-9000 (Lima) o al 0801-00802 (provincias) y selecciona la opción 0 para bloquearla y evitar que otras personas puedan usarla. La atención es durante las 24 horas del día, todos los días del año. Una vez efectuado el bloqueo recibirás una constancia de la operación realizada al correo electrónico (virtual) o domicilio (físico) que tengas registrado en el banco. También puedes solicitar el recojo en cualquiera de nuestras Tiendas Interbank.'
	}else if(isContain(messageText,'info')){ 

		mensaje = ' Hola que tal si deseas mayor informacion visita nuestra página web \n'
	}else if(isContain(messageText, 'fecha')){
		mensaje = 'Comunícate de inmediato a nuestra Banca Telefónica al (01) 311-9000 (Lima) o al 0801-00802 (provincias) y selecciona la opción 0 para bloquearla y evitar que otras personas puedan usarla. La atención es durante las 24 horas del día, todos los días del año. Una vez efectuado el bloqueo recibirás una constancia de la operación realizada al correo electrónico (virtual) o domicilio (físico) que tengas registrado en el banco. También puedes solicitar el recojo en cualquiera de nuestras Tiendas Interbank.'
	}else if(isContain(messageText,'credito')){
		mensaje= 'La ampliación de línea de crédito de las Tarjetas de Crédito Interbank se otorga a los clientes con campaña vigente. Para ello, el banco realiza periódicamente una evaluación de sus clientes para ofrecerles, según sus consumos y pagos previos, dicho incremento. Para más información, visita la página de Incremento de Línea de Consumo'
	}else if(isContain(messageText,'tu')){
		enviarMensajeImagen(senderID)
	}else if(isContain(messageText,'perfil')){
		enviarMensajeTemplate(senderID)
	}else if(isContain(messageText,'recibo')){
		mensaje = 'La ampliación de línea de crédito de las Tarjetas de Crédito Interbank se otorga a los clientes con campaña vigente. Para ello, el banco realiza periódicamente una evaluación de sus clientes para ofrecerles, según sus consumos y pagos previos, dicho incremento. Para más información, visita la página de Incremento de Línea de Consumo'

	}else if(isContain(messageText,'clima')|| isContain(messageText, 'temperatura')){
		getClima(function(_temperatura){
			enviarMensajeTexto(senderID,getMessageCLima(_temperatura))
		})

	}

	else{
		mensaje = ' no tengo tu respuesta T_T podrías explicarme un poco más por favor :D' + messageText
	}
	enviarMensajeTexto(senderID, mensaje)

}

function enviarMensajeTemplate(senderID){
	var messageData = {
		recipient: {
			id : senderID
		},
		message:{
			attachment :{
				type: "template",
				payload: {
					template_type: 'generic',
					elements: [elementTemplate(), elementTemplate(),elementTemplate,elementTemplate()]
				}
			}
		}
	}
	callSendAPI(messageData)
}

function elementTemplate(){
	return{
		title: "Eliza",
		subtitle: "Asistente Interbank",
		item_url: "https://interbank.pe/",
		image_url: "https://s-media-cache-ak0.pinimg.com/736x/96/99/a1/9699a188a8a5ccf64c55908658971203.jpg",
		buttons: [
			buttonTemplate('Contactame','https://interbank.pe/'),
			buttonTemplate('Contactame', 'https://interbank.pe/')
		]
	}
}


function buttonTemplate(title, url){
	return{
		type:'web_url',
		url:url,
		title:title
	}
}


//enviar imagen
function enviarMensajeImagen(senderID){
	var messageData = {
		recipient:{
			id: senderID
		},
		message:{
			attachment: {
				type: "image",
				payload: {
					url: 'https://s-media-cache-ak0.pinimg.com/736x/96/99/a1/9699a188a8a5ccf64c55908658971203.jpg'

				}
			}
		}
	}
	callSendAPI(messageData)
}
//enviar texto plana
function enviarMensajeTexto(senderID, mensaje){
	var messageData = {
		recipient : {
			id:senderID
		},
		message: {
			text: mensaje
		}
	}
	callSendAPI(messageData)
}
//formatear el texto de regreso al cliente
function getMessageCLima(temperatura){
	if(temperatura >30){
		return "Nos encontramos a " + temperatura +". Hay demasiado calor, mejor usa el app o web para tus operaciones :)"
	
	}else{
		return "Nos encontramos a " + temperatura +". Disfruta tu día usando el app o BPI para tus operaciones"
	}
}



//enviar texto en temperatura
function getClima(callback){
	request('http://api.geonames.org/findNearByWeatherJSON?lat=-12.046374&lng=-77.042793&username=eduardo_gpg',
		function(error, response, data){
			if(!error){
				var response = JSON.parse(data)
				var temperatura = response.weatherObservation.temperature
				callback(temperatura)
			}else{
				callback(15) //temperatura por defecto
			}
		})
}

function callSendAPI(messageData){
			
	//api facebook
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token: APP_TOKEN},
		method: 'POST',
		json: messageData
	}, function(error,response,data){
			if(error)
				console.log('No es posible enviar el mensaje')
			else
				console.log('Mensaje enviado')
	})				
}

function isContain(texto,word){
	if(typeof texto=='undefined' || texto.lenght<=0) return false
	return texto.indexOf(word) > -1
}



