var qs = require('querystring');
var http = require('http');
var fs = require('fs');

var chat = {};
var mensagens=[];
var usuario;
var nomeDoChat;
var chatutilizado = "";

function getPostRequest(req, action) {
	var body = '';

	req.on('data', function (data) {
		body += data;
		if (body.length > 1000000)
			req.connection.destroy();
	});

	req.on('end', function () {
		action(qs.parse(body));
	});
}


function criarChat(req, res) {
	if (req.method === 'POST') {
		getPostRequest(req, function (obj) {
			res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
			chat[obj.nomeChat] = obj.usuario;
			res.writeHead(302, {'Location': '/chat.html'});//Salvando o nome do usuario e nome do chat para na proxima página o chat receber estes dados
			usuario = obj.usuario;
			nomeDoChat = obj.nomeChat;
			res.end();
		});
	} else {
		res.write("Dados inválidos", "utf-8");
		res.end();
	}
}

function carregarPagina(url, res) {
	fs.readFile(url, function(err, data) {
		res.writeHead(200, {'Content-Type': 'text/html', 'charset':'utf-8'});
		res.write(data);
		res.end();
	});
}

function retornarTexto(res)//Retorna a string escrita no chat
{
	res.writeHead(200, {"Content-Type": "text/plain"});
	res.end(mensagens[chatutilizado]);
}

function retornarUsuario(res)//Retorna o nome do usuário
{
	res.writeHead(200, {"Content-Type": "text/plain"});
	res.end(usuario);
	usuario = "";
}


function retornarNomeChat(res)//Retorna o nome do Chat
{
	res.writeHead(200, {"Content-Type": "text/plain"});
	res.end('Nome do chat: ' + nomeDoChat);
	nomeDoChat = "";
}

function adicionarTexto(req,res)//Adiciona o texto ao chat
{
	if (req.method === 'POST') {
		getPostRequest(req, function (obj) {
			res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
			if (obj.msgescrita != undefined) {
				if(mensagens[chatutilizado]!=undefined)
					mensagens[chatutilizado] = mensagens[chatutilizado] + obj.msgescrita;
				else
					mensagens[chatutilizado] = obj.msgescrita;
				chatutilizado = "";
			} else {
				res.write("Dados invalidos!", "utf-8");
			}
			res.end();
		});
	} else {
		res.write("Dados inválidos", "utf-8");
		res.end();
	}
}

function receberChat(req,res)//Recebe qual chat deve ser utilizado no envio ou recebimento de dados
{
	if (req.method === 'POST') {
		getPostRequest(req, function (obj) {
			res.writeHead(200, {"Content-Type": "text/html; charset=utf-8"});
			if (obj.chat != undefined) {
				chatutilizado = obj.chat;
			} else {
				res.write("Dados invalidos!", "utf-8");
			}
			res.end();
		});
	} else {
		res.write("Dados inválidos", "utf-8");
		res.end();
	}
}

http.createServer(function (req, res) {
	var url = req.url;
	switch (url) {
		case '/index.html':
		case '/chat.html':
			carregarPagina(req.url.substring(1), res);
			break;
		case '/entrar':
			criarChat(req,res);
			break;
		case '/texto':
			retornarTexto(res);
			break;
		case '/enviar':
			adicionarTexto(req,res);
			break;
		case '/usuario':
			retornarUsuario(res);
			break;
		case '/nomeChat':
			retornarNomeChat(res);
			break;
		case '/enviarchat':
			receberChat(req,res);
			break;
		default:
			carregarPagina("index.html", res);
			break;
	}
}).listen("http://teste-chat.us-3.evennode.com/");

process.on('uncaughtException', function(err) {
    console.log(err)
})
