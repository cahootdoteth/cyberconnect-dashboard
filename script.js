var https = require('https');

var options = {
    host: 'api.ethplorer.io',
    path: '/getTopTokenHolders/0xf3Db5Fa2C66B7aF3Eb0C0b782510816cbe4813b8?apiKey=freekey&limit=10',
    headers: {
        'Accept': 'application/json'
    }
};

https.get(options, function (res) { })

var axios = require('axios')

axios.get('https://api.ethplorer.io/getTopTokenHolders/0xf3Db5Fa2C66B7aF3Eb0C0b782510816cbe4813b8?apiKey=freekey&limit=10').then(function (response) {
    console.log(response.data);
}).catch(function (error) {
    console.log(error);
});