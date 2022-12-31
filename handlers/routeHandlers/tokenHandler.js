// dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { createRandomString } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
// modul;e scaffolding

const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
    const acceptedMethods = ['get', 'post', 'put', 'delete'];
    if (acceptedMethods.indexOf(requestProperties.method) > -1) {
        handler._token[requestProperties.method](requestProperties, callback);
    } else {
        callback(405);
    }
};

// scaffolding

handler._token = {};

handler._token.post = (requestProperties, callback) => {
    const phone =
        typeof requestProperties.body.phone === 'string' &&
        requestProperties.body.phone.trim().length === 11
            ? requestProperties.body.phone
            : false;

    const password =
        typeof requestProperties.body.password === 'string' &&
        requestProperties.body.password.trim().length > 0
            ? requestProperties.body.password
            : false;
    if (phone && password) {
        data.read('users', phone, (err1, userData) => {
            const hashedpassword = hash(password);
            if (hashedpassword === parseJSON(userData).password) {
                const tokenId = createRandomString(20);
                const expires = Date.now() + 60 * 60 * 1000;
                const tokenObject = {
                    phone,
                    id: tokenId,
                    expires,
                };

                // store the token
                data.create('tokens', tokenId, tokenObject, (err2) => {
                    if (!err2) {
                        callback(200, tokenObject);
                    } else {
                        callback(500, {
                            error: 'There was a problem in the server side!',
                        });
                    }
                });
            } else {
                callback(400, {
                    error: 'Password is not valid!',
                });
            }
        });
    } else {
        callback(400, {
            error: 'You have a problem in your request',
        });
    }
};

handler._token.get = (requestProperties, callback) => {
    // check token id if valid
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        // lookup the token
        data.read('tokens', id, (err, tokenData) => {
            const token = { ...parseJSON(tokenData) };
            if (!err && token) {
                callback(200, token);
            } else {
                callback(404, {
                    error: 'Requested token was not found!',
                });
            }
        });
    } else {
        callback(404, {
            error: 'Requested token was not found!',
        });
    }
};

handler._token.put = (requestProperties, callback) => {
     // check phone number if valid
     const id =
        typeof requestProperties.body.id === 'string' &&
        requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;

     const extend =
         typeof requestProperties.body.extend === 'boolean' &&
         requestProperties.body.extend === true
                ? true
                : false;

     if(id && extend) {
        data.read('tokens', id, (err1, tokenData) => {
            let tokenObject = parseJSON(tokenData);
             if(tokenObject.expires > Date.now()) {
                tokenObject.expires = Date.now() + 60*60*1000;
                //token store update
                data.update('tokens', id, tokenObject, (err2) => {
                    if(!err2) {
                        callback(200);
                    } else {
                        callback(404, {
                            error: 'token already expired',
                        });
                    }
                });
             } else {
                callback(404, {
                    error: 'token already expired',
                });
             }
        });
     } else {
        callback(404, {
            error: 'Requested token was not found!',
        });
    }
};

handler._token.delete = (requestProperties, callback) => {
        // check the token number if valid
        const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
        requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

            if(id) {
            //look for the user
            data.read('tokens', id, (err1, tokenData) => {
                if(!err1 && tokenData) {
                    data.delete('tokens', id, (err2) => {
                        if (!err2) {
                            callback(200, {
                                message: 'token deleted',
                            });
                        } else {
                            callback(500, {
                                error: "theres a problm in youre req",
                            });
                        }
                    })
                }else {
                    callback(500, {
                        error: "theres a problm in youre req",
                    });
                }
            });
            } else {
                callback(400, {
                    error: "theres a problm in youre req",
                });
            }
};

handler._token.verify = (id, phone, callback) => {
    data.read = ('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
              callback(true);
               
            } else {
               callback(false);
                
            }
        } else {
           callback(false);
          
        }
    });
};

module.exports = handler;
