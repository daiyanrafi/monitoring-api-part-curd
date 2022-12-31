
// dependencies
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/enviroments')

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._check[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

handler._check = {};

handler._check.post = (requestProperties, callback) => {
    //validation inputs
    let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf
    (requestProperties.body.protocol) > -1 ? requestProperties.body.protocol: false;

    let url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 
    ? requestProperties.body.protocol: false;

    let method = typeof(requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf 
    (requestProperties.body.method) > -1 ? requestProperties.body.protocol: false;

    let successCodes = typeof(requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes
    instanceof Array  ? requestProperties.body.successCodes: false;

    let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds
    % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? 
    requestProperties.body.successCodes: false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        let token =
         typeof requestProperties.headersObject.token === 'string'
        ? requestProperties.headersObject.token
        : false;

        //look up the user phone by reading token
        data.read('tokens', token, (err1, tokenData) => {
            if(!err1 && tokenData) {
                let userPhone = parseJSON(tokenData).phone;
                //lookup the user class
                data.read('users', userPhone, (err2, userData) => {
                    if(!err2 && userData) {
                        //start
                        tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
                            if(tokenIsValid) {
                                let userObject = parseJSON(userData); 
                                let userChecks = typeof(userObject.checks) === 'object' && userObject.checks 
                                instanceof Array ? userObject.checks : [];

                                if(userChecks.length < maxChecks) {
                                    let checkId = createRandomString(20);
                                    let checkObject = {
                                        'id' : checkId,
                                        'userPhone' : userPhone,
                                        'protocol' : protocol,
                                        'url' : url,
                                        'method' : method,
                                        'succesCodes' : successCodes,
                                        'timeoutSeconds' : timeoutSeconds,
                                    };
                                    //save the obj
                                    data.create ('checks', checkId, checkObject, (err3) => {
                                        if (!err3) {
                                            //add check id to user obj
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            //save the new user

                                            data.update('users', userPhone, userObject, (err4) => {
                                                if(!err4) {
                                                    // return the data about new check
                                                    callback(201, checkObject);
                                                } else {
                                                    callback(508, {
                                                        error: 'problm in server side',
                                                    });
                                                }
                                            });
                                        } else {
                                            callback(507, {
                                                error: 'problm in server side',
                                            });
                                        }
                                    });
                                } else {
                                    callback(407, {
                                        error: 'max bro',
                                    });
                                }
                            }else {
                                callback(406, {
                                    error: 'not found',
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: 'not found',
                        });
                    }
                });

            }else {
                callback(405, {
                    error: 'you have problm in you check input',
                });
            }
        });

    } else {
        callback(400, {
            error: 'you have problm in you check input',
        });
    }
};
//ok

handler._check.get = (requestProperties, callback) => {
    const id =
    typeof requestProperties.queryStringObject.id === 'string' &&
    requestProperties.queryStringObject.id.trim().length === 20
        ? requestProperties.queryStringObject.id
        : false;
        if(id) {
            data.read ('checks', id, (err, checkData) => {
                if(!err && chechData) {
                    let token =
         typeof requestProperties.headersObject.token === 'string'
        ? requestProperties.headersObject.token
        : false;

        tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
            if(tokenIsValid) {
                callback(200, parseJSON(checkData));
            } else {
                callback(400, {
                    error: 'authentication failed',
                });
            }
        });

                } else {
                    callback(400, {
                        error: 'you have problm in you check input',
                    });
                }
            });
        } else {
            callback(400, {
                error: 'you have problm in you check input',
            });
        }

};

handler._check.put = (requestProperties, callback) => {
    const id =
    typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 20
        ? requestProperties.body.id
        : false;


        let protocol = typeof(requestProperties.body.protocol) === 'string' && ['http', 'https'].indexOf
        (requestProperties.body.protocol) > -1 ? requestProperties.body.protocol: false;
    
        let url = typeof(requestProperties.body.url) === 'string' && requestProperties.body.url.trim().length > 0 
        ? requestProperties.body.protocol: false;
    
        let method = typeof(requestProperties.body.method) === 'string' && ['GET', 'POST', 'PUT', 'DELETE'].indexOf 
        (requestProperties.body.method) > -1 ? requestProperties.body.protocol: false;
    
        let successCodes = typeof(requestProperties.body.successCodes) === 'object' && requestProperties.body.successCodes
        instanceof Array  ? requestProperties.body.successCodes: false;
    
        let timeoutSeconds = typeof(requestProperties.body.timeoutSeconds) === 'number' && requestProperties.body.timeoutSeconds
        % 1 === 0 && requestProperties.body.timeoutSeconds >= 1 && requestProperties.body.timeoutSeconds <= 5 ? 
        requestProperties.body.successCodes: false;

        if(id) {
            if (protocol || url || method || succesCodes || timeoutSeconds) {
                data.read('checks', id, (err1, checkData) => {
                    if(!err1 && checkData) {
                        //checkdata convert to object
                        let checkObject = parseJSON(checkData);
                        let token =
         typeof requestProperties.headersObject.token === 'string'
        ? requestProperties.headersObject.token
        : false;

        tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
            if(tokenIsValid) {
                if (protocol) {
                    checkObject.protocol = protocol;
                }
                if (url) {
                    checkObject.url = url;
                }
                if (method) {
                    checkObject.method = method;
                }
                if (successCodes) {
                    checkObject.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                    checkObject.timeoutSeconds = timeoutSeconds;
                }
                //store checkobject
                data.update('checks', id , checkObject, (err2) => {
                    if(!err2) {
                        callback(200);
                    } else {
                        callback(400, {
                            error: 'server side error',
                        });
                    }
                });
            }else {
                callback(400, {
                    error: 'authentication error',
                });
            }
        });
                    } else {
                        callback(400, {
                            error: 'serverside problm',
                        });
                    }
                });

            } else {
                callback(400, {
                    error: 'you have to fill up one field',
                });
            }
        } else {
            callback(400, {
                error: 'authentication failed',
            });
        }

};

handler._check.delete = (requestProperties, callback) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (id) {
        // lookup the check
        data.read('checks', id, (err1, checkData) => {
            if (!err1 && checkData) {
                const token =
                    typeof requestProperties.headersObject.token === 'string'
                        ? requestProperties.headersObject.token
                        : false;

                tokenHandler._token.verify(
                    token,
                    parseJSON(checkData).userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            // delete the check data
                            data.delete('checks', id, (err2) => {
                                if (!err2) {
                                    data.read(
                                        'users',
                                        parseJSON(checkData).userPhone,
                                        (err3, userData) => {
                                            const userObject = parseJSON(userData);
                                            if (!err3 && userData) {
                                                const userChecks =
                                                    typeof userObject.checks === 'object' &&
                                                    userObject.checks instanceof Array
                                                        ? userObject.checks
                                                        : [];

                                                // remove the deleted check id from user's list of checks
                                                const checkPosition = userChecks.indexOf(id);
                                                if (checkPosition > -1) {
                                                    userChecks.splice(checkPosition, 1);
                                                    // resave the user data
                                                    userObject.checks = userChecks;
                                                    data.update(
                                                        'users',
                                                        userObject.phone,
                                                        userObject,
                                                        (err4) => {
                                                            if (!err4) {
                                                                callback(200);
                                                            } else {
                                                                callback(500, {
                                                                    error:
                                                                        'There was a server side problem!',
                                                                });
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    callback(500, {
                                                        error:
                                                            'The check id that you are trying to remove is not found in user!',
                                                    });
                                                }
                                            } else {
                                                callback(500, {
                                                    error: 'There was a server side problem!',
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    callback(500, {
                                        error: 'There was a server side problem!',
                                    });
                                }
                            });
                        } else {
                            callback(403, {
                                error: 'Authentication failure!',
                            });
                        }
                    }
                );
            } else {
                callback(500, {
                    error: 'You have a problem in your request',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

module.exports = handler;
//ok