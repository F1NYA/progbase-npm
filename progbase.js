const https = require('https');
const path = require('path');
const {URL} = require('url');
const os = require('os');
const storage = require('./storage');

const defaultRootDirPath = path.join(os.homedir(),'.Progbase');

function url(reqPath, username, password) {
    const reqUrl = new URL('https://progbase.herokuapp.com');
    reqUrl.pathname = '/api/v1/' + reqPath;
    reqUrl.username = username;
    reqUrl.password = password;
    return reqUrl;
}
const progbase = (bitbucket_username = '', progbase_api_key = '', rootDirPath = defaultRootDirPath) => {
    const defaultDataPath = path.join(rootDirPath,'Data');
    const Storage = storage(rootDirPath);
    let User = {
        bitbucket_username: bitbucket_username,
        progbase_api_key: progbase_api_key
    };
    if (User.bitbucket_username && User.progbase_api_key)
        Storage.setData(User, 'auth_data.txt', defaultDataPath, true);
    else {
        const authData = Storage.getData('auth_data.txt', defaultDataPath, true);
        if (authData) {
            User.bitbucket_username = authData.bitbucket_username;
            User.progbase_api_key = authData.progbase_api_key;
        }
    }

    function getRequest(reqPath = '', reqDataFileName = 'data.json', user = '') {
        const reqUrl = url(reqPath,user.bitbucket_username,user.progbase_api_key);
        https.get(reqUrl, res => {
            console.log(res.statusCode);
            let data = '';
            res.on('data', chunk => {data += chunk});
            res.on('end', () => {Storage.setData(data,reqDataFileName,defaultDataPath)});
        }).on('error', err => console.error('ERROR: request', err));
    }
    function getRequestData(reqPath = '', reqDataFileName = 'data.json', user = '') {
        if(Storage.dataExists(reqDataFileName))
            return Storage.getData(reqDataFileName, defaultDataPath);
        return getRequest(reqPath,reqDataFileName,user);
    }
    return {
        origin() {
            const reqPath = '';
            const reqDataFileName = path.format({name:'origin',ext:'.json'});
            getRequestData(reqPath,reqDataFileName,User);
            return {
                getData() {
                    return getRequestData(reqPath,reqDataFileName,User);
                }
            }
        },
        courses() {
            const reqPath = 'courses';
            const reqDataFileName = path.format({name:'courses',ext:'.json'});
            getRequestData(reqPath,reqDataFileName);
            return {
                getData() {
                    return getRequestData(reqPath,reqDataFileName,User);
                }
            }
        },
        course(course_id) {
            const reqPath = 'courses/' + course_id;
            const reqDataFileName = path.format({name:'courses_'+course_id,ext:'.json'});
            getRequestData(reqPath,reqDataFileName,User);
            return {
                getData() {
                    return getRequestData(reqPath,reqDataFileName,User);
                }
            }
        },
        modules() {
            const reqPath = 'modules';
            const reqDataFileName = path.format({name:'modules',ext:'.json'});
            getRequestData(reqPath,reqDataFileName,User);
            return {
                getData() {
                    return getRequestData(reqPath,reqDataFileName,User);
                }
            }
        },
        module(module_id) {
            const reqPath = 'modules/' + module_id;
            const reqDataFileName = path.format({name:'modules_'+module_id,ext:'.json'});
            getRequestData(reqPath,reqDataFileName);
            return {
                getData() {
                    return getRequestData(reqPath,reqDataFileName,User);
                }
            }
        },
        tasks(module_id) {
            const reqPath = 'modules/' + module_id + '/tasks';
            const reqDataFileName = path.format({name:'modules_'+module_id+'_tasks',ext:'.json'});
            getRequestData(reqPath,reqDataFileName,User);
            return {
                getData() {
                    return getRequestData(reqPath,reqDataFileName,User);
                }
            }
        },
        user(username) {
            const reqPath = 'users/' + username;
            const reqDataFileName = path.format({name:'users_'+username,ext:'.json'});
            getRequestData(reqPath,reqDataFileName,User);
            return {
                getData() {
                    return getRequestData(reqPath,reqDataFileName,User);
                }
            }
        },
        me() {
            const reqPath = 'user';
            const reqDataFileName = path.format({name:'user',ext:'.json'});
            getRequestData(reqPath,reqDataFileName,User);
            return {
                getData() {
                    return getRequestData(reqPath,reqDataFileName,User);
                }
            }
        },
        myCommits() {
            const reqPath = 'user/commits';
            const reqDataFileName = path.format({name:'user_commits',ext:'.json'});
            getRequestData(reqPath,reqDataFileName,User);
            return {
                getData() {
                    return getRequestData(reqPath,reqDataFileName,User);
                }
            }
        },
        commits(username) {
            const reqPath = 'users/' + username + '/commits';
            const reqDataFileName = path.format({name:'users_'+username+'_commits',ext:'.json'});
            getRequestData(reqPath,reqDataFileName,User);
            return {
                getData() {
                    return getRequestData(reqPath,reqDataFileName,User);
                }
            }
        },
        groups() {
            const reqPath = 'groups';
            const reqDataFileName = path.format({name:'groups',ext:'.json'});
            getRequestData(reqPath,reqDataFileName,User);
            return {
                getData() {
                    return getRequestData(reqPath,reqDataFileName,User);
                }
            }
        },
        group(group_id) {
            const reqPath = 'groups/' + group_id;
            const reqDataFileName = path.format({name:'groups_' + group_id,ext:'.json'});
            getRequestData(reqPath,reqDataFileName,User);
            return {
                getData() {
                    return getRequestData(reqPath,reqDataFileName,User);
                }
            }
        }
    }
};

module.exports = progbase;

/*const Progbase = progbase();
console.log(Progbase.origin().getData());
console.log(Progbase.courses().getData());
console.log(Progbase.modules().getData());
console.log(Progbase.module('progbase').getData());
console.log(Progbase.module('webprogbase').getData());
console.log(Progbase.user('kirick1').getData());
console.log(Progbase.me().getData());
console.log(Progbase.myCommits().getData());
console.log(Progbase.groups().getData());*/
