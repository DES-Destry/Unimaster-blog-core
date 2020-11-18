const controller = require('../../controllers/userController');
const authController = require('../../controllers/authController');
const { validations } = require('../../lib/utils');

module.exports = (router) => {
    /*
        -Functional:
        Changing profile description of blog user.

        -Usage:
        Made PUT request to  hostname/api/auth/description with request body.
        Request body contains 1 value: "newDescription".
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.
        Request must be authenticated. Don't forget for "Authorization: Bearer {some_token}" header.
        
        -Server validation:
        newDescription -> not less than 10 and not longer than 5000 symbols.

        -Example:
        PUT http://localhost:3000/api/user/description
        Content-Type: application/json
        Authorization: Bearer {token}

        {
            "newDescription": "Hello. My name is NAME. How are you?"
        }
    */
    router.put('/description', validations.description, authController.auth, controller.changeDescription);


    /*
        -Functional:
        Changing profile username of blog user.

        -Usage:
        Made PUT request to  hostname/api/auth/username with request body.
        Request body contains 1 value: "newUsername".
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.
        Request must be authenticated. Don't forget for "Authorization: Bearer {some_token}" header.
        
        -Server validation:
        newUsername -> not empty and not email.

        -Example:
        PUT http://localhost:3000/api/user/username
        Content-Type: application/json
        Authorization: Bearer {token}

        {
           "newUsername": "Pineapple"
        }
    */
    router.put('/username', validations.username, authController.auth, controller.changeUsername);
}