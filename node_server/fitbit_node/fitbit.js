#!/usr/bin/env node
// fitbit integration with nodejs
// Rodrigo Alvez: alvezrodrigo@icloud.com

//dependencies
var request = require('request');
var http = require("http")
var url = require("url");
var querystring = require('querystring');

var start = function(code){
	request({
            url: 'https://api.fitbit.com/oauth2/token',
            method: 'POST',
	    headers:{
	    	'Authorization': 'Basic ' + new Buffer("227NNZ:21d2d5b03407a78a3b30eac4d8502bcc").toString('base64')
	    },
            form: {
                'grant_type': 'authorization_code',
		'redirect_uri': 'http://ec2-52-63-44-250.ap-southeast-2.compute.amazonaws.com:8889/login',
		'code': code,
		'client_id': '227NNZ'

            }
        }, function(err, response) {
        	var json = JSON.parse(response.body);
		printHR(json.user_id, json.access_token);
		response.writeHead(200,{"Content-Type": "text/plain"});
                response.end("HR Received");
	});
}

function printHR(user_id, access_token){
	request({
		url: 'https://api.fitbit.com/1/user/'+user_id+'/activities/heart/date/today/1d.json',
		method: 'GET',
		headers:{
			'Authorization': 'Bearer ' + access_token
		}
	}, function(err, response){
		var json = JSON.parse(response.body);
		var restingHeartRate = json['activities-heart'][0].value.restingHeartRate;
	});
	
}

//callback function to receive fitbit API token
function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    if (pathname === '/login') {
	login(request);
	
/*	console.log(response);
        var json = JSON.parse(response.body);
        console.log("Access Token:", json.access_token);*/
    }
}

//get Authentication Token
function login(request){
	if (request.method == 'GET') {
	//	console.log("[200] " + request.method + " to " + request.url);
 		var url_parts = url.parse(request.url, true);
		var query = url_parts.query;
		start(query.code);
	}else{
		console.log("[200] " + request.method + " to " + request.url);
		var fullBody = '';
		console.log(fullBody);
		request.on('data', function(chunk) {
			fullBody += chunk.toString();
		});
		request.on('end', function() {
			 // parse the received body data
			 var decodedBody = querystring.parse(fullBody);	
			 var token = querystring.parse(fullBody)['token'];
		});
	}
 }

http.createServer(onRequest).listen(8889);

module.exports.start = start;
