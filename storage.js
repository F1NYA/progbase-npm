const fs = require('fs');
const os = require('os');
const path = require('path');
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

const storage = (rootDirPath) => {
    if(!fs.existsSync(rootDirPath)) fs.mkdirSync(rootDirPath);
    if(!fs.existsSync(path.join(rootDirPath, 'Data'))) fs.mkdirSync(path.join(rootDirPath, 'Data'));
    return {
        setData(data, fileName = 'data.txt', pathToDir = rootDirPath, encode = false) {
            if(encode) data = Cipher(JSON.stringify(data));
            fs.writeFileSync(path.join(pathToDir, fileName), data, options);
        },
        getData(fileName = 'data.txt', pathToDir = rootDirPath, decode = false) {
            if(fs.existsSync(path.join(pathToDir, fileName))) {
                const data = fs.readFileSync(path.join(pathToDir, fileName), options);
                if(decode) return JSON.parse(Decipher(data));
                else return data;
            } else return null;
        },
        clear() {
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


module.exports = storage;