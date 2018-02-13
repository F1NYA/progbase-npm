const fs = require('fs');
const os = require('os');
const path = require('path');
const util = require('util');
const crypto = require('crypto');

const {join} = path;

const defaultSecret = os.userInfo({encoding:'base64'}).username.toString() + os.userInfo({encoding:'base64'}).homedir.toString();
const options = { encoding: 'utf8' };

function Cipher(data, secret = defaultSecret) {
    const cipher = crypto.createCipher('aes192', secret);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
function Decipher(encrypted, secret = defaultSecret) {
    const decipher = crypto.createDecipher('aes192', secret);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const mkDir = util.promisify(fs.mkdir);
const writeFile = util.promisify(fs.writeFile);
const rmDir = util.promisify(fs.rmdir);
const readDir = util.promisify(fs.readdir);
const statFile = util.promisify(fs.stat);
const unLink = util.promisify(fs.unlink);

const storage = (rootDirPath) => {
    if(!fs.existsSync(rootDirPath)) mkDir(rootDirPath)
        .then(() => mkDir(join(rootDirPath,'Data'))
              .catch(err => console.error('ERROR: creating directory ' + join(rootDirPath, 'Data'), err)))
        .catch(err => console.error('ERROR: creating directory ' + rootDirPath, err));
    return {
        setData(data, fileName = 'cache.txt', pathToDir = rootDirPath, encode = false) {
            writeFile(join(pathToDir,fileName), encode ? Cipher(JSON.stringify(data)) : data, options);
        },
        getData(fileName = 'cache', pathToDir = rootDirPath, decode = false) {
            if(fs.existsSync(join(pathToDir,fileName))) {
                const data = fs.readFileSync(join(pathToDir, fileName), options);
                return decode ? JSON.parse(Decipher(data)) : data;
            } else return null;
        },
        clear() {
            if(fs.existsSync(rootDirPath)) {
                readDir(rootDirPath)
                    .then(files => files.forEach(file => statFile(join(rootDirPath,file))
                        .then(stat => stat.isFile() ?
                            unLink(join(rootDirPath,file)).catch(err => console.error('ERROR: removing file ' + file, err)) :
                            rmDir(join(rootDirPath,file)).then(() => rmDir(rootDirPath).catch(err => console.error('ERROR: removing root directory', err))).catch(err => console.error('ERROR: removing directory ' + file, err)))
                        .catch(err => console.error('ERROR: stat file ' + file, err))
                    .catch(err => console.error('ERROR: reading directory ' + rootDirPath, err))));
                return true;
            } else return false;
        },
        dataExists(fileName = 'data.json') {
            return fs.existsSync(join(rootDirPath,'Data',fileName));
        }
    }
};

module.exports = storage;
