const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');
const crypto = require('crypto');

const secret = os.userInfo({encoding:'base64'}).username.toString() + os.userInfo({encoding:'base64'}).homedir.toString();
const options = { encoding: 'utf8' };

function Cipher(data, secret = secret) {
    const cipher = crypto.createCipher('aes192', secret);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
function Decipher(encrypted, secret = secret) {
    const decipher = crypto.createDecipher('aes192', secret);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const mkDir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);
const rmDir = util.promisify(fs.rmdir);
const readDir = util.promisify(fs.readdir);
const statFile = util.promisify(fs.stat);
const unLink = util.promisify(fs.unlink);

const storage = (rootDirPath) => {
    if(!fs.existsSync(rootDirPath)) mkDir(rootDirPath).then(() => {
        if(!fs.existsSync(path.join(rootDirPath, 'Data'))) mkDir(path.join(rootDirPath, 'Data')).catch(err => console.error('ERROR: creating directory ' + path.join(rootDirPath, 'Data'), err))})
        .catch(err => console.error('ERROR: creating directory ' + rootDirPath, err));
    return {
        setData(data, fileName = 'data.txt', pathToDir = rootDirPath, encode = false) {
            writeFile(path.join(pathToDir, fileName), encode ? Cipher(JSON.stringify(data)) : data, options)
        },
        getData(fileName = 'data.txt', pathToDir = rootDirPath, decode = false) {
            if(fs.existsSync(path.join(pathToDir, fileName))) {
                const data = readFile(path.join(pathToDir, fileName), options);
                if(decode) return JSON.parse(Decipher(data));
                else return data;
            } else return null;
        },
        clear() {
            if(fs.existsSync(rootDirPath)) {
                readDir(rootDirPath).then(files => files.forEach(file => statFile(path.join(rootDirPath,file))
                    .then(stat => stat.isFile() ?
                        unLink(path.join(rootDirPath,file))/*.then(() => rmDir(rootDirPath).catch(err => console.error('ERROR: removing root directory', err)))*/.catch(err => console.error('ERROR: removing file ' + file, err)) :
                        rmDir(path.join(rootDirPath,file)).then(() => rmDir(rootDirPath).catch(err => console.error('ERROR: removing root directory', err))).catch(err => console.error('ERROR: removing directory ' + file, err)))
                    .catch(err => console.error('ERROR: stat file ' + file, err))
                    .catch(err => console.error('ERROR: reading directory ' + rootDirPath, err))));
                return true;
            } else return false;
        }
    }
};

module.exports = storage;

/*const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const callBackToPromise = func => (...args) =>
    new Promise((resolve, reject) => {
        const callback = (error, data) => error ? reject(error) : resolve(data);
        func.apply(this, [...args, callback]);
    });

const dirExists = callBackToPromise(fs.exists);
const mkDir = callBackToPromise(fs.mkdir);
const writeFile = callBackToPromise(fs.writeFile);
const readFile = callBackToPromise(fs.readFile);

const secret = os.userInfo({encoding:'base64'}).username.toString() + os.userInfo({encoding:'base64'}).homedir.toString();
const options = { encoding: 'utf8' };

function Cipher(data, secret = secret) {
    const cipher = crypto.createCipher('aes192', secret);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
function Decipher(encrypted, secret = secret) {
    const decipher = crypto.createDecipher('aes192', secret);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const storage = (rootDirPath) => {
    dirExists(rootDirPath)
        .then(exists => exists || mkDir(rootDirPath))
        .then(() => dirExists(path.join(rootDirPath, 'Data')))
        .then(exists => exists || mkDir(rootDirPath));
    return {
        setData: (data, fileName = 'data.txt', pathToDir = rootDirPath, encode = false) =>
            writeFile(path.join(pathToDir, fileName), encode ? data : Cipher(JSON.stringify(data)), options),
        getData: (fileName = 'data.txt', pathToDir = rootDirPath, decode = false) =>
            dirExists(path.join(pathToDir, fileName))
                .then(exists => {
                    if (exists) return readFile(path.join(pathToDir, fileName), options);
                    throw new Error('no file');
                })
                .then(data => decode ? JSON.parse(Decipher(data)) : data)
                .catch(err => err.message === 'no file' ? null : err),
        clear: () => {
            if(fs.existsSync(rootDirPath)) {
                fs.readdirSync(rootDirPath).forEach(file => {
                    const pathToFile = path.join(rootDirPath, file);
                    const fileStat = fs.statSync(pathToFile);
                    if(fileStat.isFile()) fs.unlinkSync(pathToFile);
                    else if(fileStat.isDirectory()) fs.rmdirSync(pathToFile);
                });
                fs.rmdirSync(rootDirPath);
                return true;
            } else return false;
        }
    }
};

module.exports = storage;*/