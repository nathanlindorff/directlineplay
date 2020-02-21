const request = require("request");
const WebSocketClient  = require('websocket').client;
require('dotenv').config()

const BOT_SECRET = process.env.BOT_SECRET;
const base_url = "https://australia.directline.botframework.com/v3/directline";



function generateToken() {
    return new Promise((resolve, reject) => {
        request({
            url: `${base_url}/tokens/generate`,
            method: "POST",
            headers: {
                Authorization: `Bearer ${BOT_SECRET}`,
                "content-type": "application/json"
            },
            body: {
                user: {
                    id: "testId",
                    name: "Buster"
                }
            },
            json: true
        },
        (error, response, body) => {
            if (!error && response.statusCode < 300) {
                resolve(body)
            } else {
                reject({ 
                    status: response.statusCode, 
                    error: error 
                });
                return;
            }
            
        });
    });
}

function startConversation(token) {
    console.log(token)
    return new Promise((resolve, reject) => {
        request({
            url: `${base_url}/conversations`,
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "content-type": "application/json"
            },
            body: {
                user: {
                    id: "testId",
                    name: "Buster"
                }
            },
            json: true
        },
        (error, response, body) => {
            console.log(response.statusCode)
            if (!error && response.statusCode < 300) {
                resolve(body)
            } else {
                reject({ 
                    status: response.statusCode, 
                    error: error 
                });
                return;
            }
            
        });
    });
}

function sendActivity(token, conversationId, activity) {
    console.log(token)
    return new Promise((resolve, reject) => {
        request({
            url: `${base_url}/conversations/${conversationId}/activities`,
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "content-type": "application/json"
            },
            body: activity,
            json: true
        },
        (error, response, body) => {
            console.log(response.statusCode)
            if (!error && response.statusCode < 300) {
                resolve(body)
            } else {
                reject({ 
                    status: response.statusCode, 
                    error: error , 
                    body
                });
                return;
            }
            
        });
    });
}

function getActivities(token, conversationId, watermark) {
    console.log(token)
    return new Promise((resolve, reject) => {
        request({
            url: `${base_url}/conversations/${conversationId}/activities?watermark=${watermark}`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "content-type": "application/json"
            },
            json: true
        },
        (error, response, body) => {
            console.log(response.statusCode)
            if (!error && response.statusCode < 300) {
                resolve(body)
            } else {
                reject({ 
                    status: response.statusCode, 
                    error: error , 
                    body
                });
                return;
            }
            
        });
    });
}

function connectWebsocket(token, conversationId, url) {
    let client = new WebSocketClient();
    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
    });
    
    client.on('connect', function(connection) {
        console.log('WebSocket Client Connected');
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
        });
        connection.on('close', function() {
            console.log('echo-protocol Connection Closed');
        });
        connection.on('message', async function(message) {
            console.log("Received: '" + message.utf8Data + "'");
            try {
                let frame = JSON.parse(message.utf8Data);
                console.log(frame.activities)
                if (frame.activities.filter(act => act.type === 'endOfConversation').length === 1) {
                    let result = await getActivities(token, conversationId, null)
                    console.log(result)
                }
            } catch (e) {
                // console.log(e)
            }
        });
        
        // function sendNumber() {
        //     if (connection.connected) {
        //         var number = Math.round(Math.random() * 0xFFFFFF);
        //         connection.sendUTF(number.toString());
        //         setTimeout(sendNumber, 1000);
        //     }
        // }
        // sendNumber();
    });
    client.connect(url)
}


async function run() {
    try {
        let tokenResult = await generateToken()
        let convResult = await startConversation(tokenResult.token);

        connectWebsocket(convResult.token, convResult.conversationId, convResult.streamUrl)

        let activity = {
            "type": "message",
            "from": {
                "id": "testId",
                name: "Buster"
            },
            "text": "hello"
        }

        let actResult = await sendActivity(convResult.token, convResult.conversationId, activity);
        
        
        return actResult
    } catch (error) {
        return error
    }
}

run()
    // .then()
    .then(console.log)

