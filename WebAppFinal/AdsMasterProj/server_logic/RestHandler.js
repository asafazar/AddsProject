var querystring = require('querystring');
var https = require('https');

// var _host = 'https://itunes.apple.com/search';

function performRestRequest(host, endpoint, method, data, success){
    var dataString = JSON.stringify(data);
    var headers = {};

    if (method == 'GET'){
        endpoint += '?' + querystring.stringify(data);
    } else {
        headers = {
            'Content-Type' : 'application/json',
            'Content-Length' : 'dataString.length'
        };
    }

    var options = {
        host : host,
        path : endpoint,
        method : method,
        headers : headers
    };

    var req = https.request(options, function(res){
        res.setEncoding('utf-8');

        var responseString = '';

        res.on('data', function(data){
            responseString += data;
        });

        res.on('end', function(){
            console.log("Rest Handler got full response : " + responseString);

            // Ensure repsonse is valid JSON
            // (if not , do nothing)
            if (isJsonString(responseString)){
                var responseObject = JSON.parse(responseString);
                success(responseObject);
            }

        });
    });

    req.write(dataString);
    req.end();
}

exports.performRestRequest = performRestRequest;


//*****************************
//         Utils
//*****************************
function isJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}