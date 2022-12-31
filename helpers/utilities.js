// dependencies

// module scaffoldings
const crypto = require('crypto');

const utilities = {};

const enviroments = require('./enviroments');

// parse json string to object
utilities.parseJSON = (jsonString) => {
    let output;

    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }

    return output;
};

// hashing string

utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', enviroments.secretKey).update(str).digest('hex');
        return hash;
    }
    return false;
};

//create random string
utilities.createRandomString = (strlength) => {
   let length = strlength;
   length = typeof(strlength) === 'number' && strlength > 0 ? strlength : false;

   if(length) {
    let possiblecharacters = 'abcdefghijklmnopqrstuv1234567890';
    let output = '';
    for (let i=1; i<= length; i+=1) {   
        let randomCharacter = possiblecharacters.charAt(Math.floor(Math.random() * possiblecharacters.length));
        output += randomCharacter;
    }
    return output;
   }else {
     return false;
   }

};

// export
module.exports = utilities;

