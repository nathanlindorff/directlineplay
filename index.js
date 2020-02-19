const request = require("request");
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

async function run() {
    try {
        let result = await generateToken()
        return result;
    } catch (error) {
        return error
    }
}

run().then(console.log)
