const https = require('https');

let Api = {};

Api.get = (host, url) => {
    return new Promise((resolve, reject) => {

        const options = {
            hostname: host,
            port: 443,
            path: url,
            method: 'GET',
        }

        req = https.request(options, res => {
            let data = '';
            res.on('data', d => {
                data += d;
            });
            res.on('end', () => {
                resolve(JSON.parse(data));
            })
        })

        req.on('error', error => {
            console.error(error);
        })

        req.end();
    });
}

module.exports = Api;