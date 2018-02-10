const http = require('http');
const path = require('path');
const url = require('url');
const os = require('os');
const storage = require('./storage');

const defaultRootDirPath = path.join(os.homedir(),'.Progbase');
//const urlApiOrigin = new URL('https://progbase.herokuapp.com/api/v1');

let data = {};
function getReq(path = '/', username = null, password = null) {
    /*let options = {
        hostname: urlApiOrigin.hostname,
        path: path,
        method: 'GET',
    };
    if(username && password) {
        options.auth.username = username;
        options.auth.password = password;
    }*/
    /*http.get('https://progbase.herokuapp.com/api/v1'.href, res => {
        let data = {};
        console.log(res.statusCode);
        res.on('data', chunk => {data = chunk});
        res.on('end', () => console.log(data))
    }).on('error', error => console.log(error));*/
}
getReq();

const Progbase = (bitbucket_username = null, progbase_api_key = null, rootDirPath = defaultRootDirPath) => {
    const Storage = storage(rootDirPath);
    let User = {};
    if(bitbucket_username && progbase_api_key) {
        User.bitbucket_username = bitbucket_username;
        User.progbase_api_key = progbase_api_key;
    } else {
        const authData = Storage.getData('auth_data.txt', path.join(rootDirPath, 'Data', 'auth_data.txt'), true);
        User.bitbucket_username = authData.bitbucket_username;
        User.progbase_api_key = authData.progbase_api_key;
    }
    return {
        origin() {

        }
    }
};