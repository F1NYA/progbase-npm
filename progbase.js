const https = require('https');
const path = require('path');
const {URL} = require('url');
const os = require('os');
const storage = require('./storage');

const defaultRootDirPath = path.join(os.homedir(),'.Progbase');
const reqOptions = new URL('https://progbase.herokuapp.com');

const Progbase = (bitbucket_username = null, progbase_api_key = null, rootDirPath = defaultRootDirPath) => {
    const Storage = storage(rootDirPath);
    let User = {};
    if(bitbucket_username && progbase_api_key) {
        User.bitbucket_username = bitbucket_username;
        User.progbase_api_key = progbase_api_key;
        Storage.setData(User, 'auth_data.txt', rootDirPath, true);
    } else {
        const authData = Storage.getData('auth_data.txt', path.join(rootDirPath,'Data'), true);
        if(authData) {
            User.bitbucket_username = authData.bitbucket_username;
            User.progbase_api_key = authData.progbase_api_key;
        }
    }
    function getRequest(reqPath = '') {
        const dataFileName = path.format({name:'data' + reqPath,ext:'.json'});
        const dataFilePath = path.join(rootDirPath,'Data');
        let dataFromFile = Storage.getData(dataFileName,dataFilePath);
        if(!dataFromFile) {
            reqOptions.pathname = '/api/v1/' + reqPath;
            reqOptions.username = User.bitbucket_username;
            reqOptions.password = User.progbase_api_key;
            https.get(reqOptions, res => {
                let data = '';
                res.on('data', chunk => {data += chunk});
                res.on('end', () => {
                    const parsedData = new Buffer(data).toString();
                    //console.log(typeof(parsedData));
                    //console.log(parsedData);
                    Storage.setData(parsedData, dataFileName, dataFilePath);
                });
            }).on('error', error => console.error(error));
        } else return dataFromFile;
    }
    return {
        origin() {
            getRequest();
        }
    }
};

//console.log(Progbase().origin());

const Storage = storage(defaultRootDirPath);
Storage.setData(JSON.stringify({g:'sjdn',h:'sdjnvlk'}));
//console.log(Storage.getData());
Storage.clear();

