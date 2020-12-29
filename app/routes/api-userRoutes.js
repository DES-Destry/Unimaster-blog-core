const controller = require('../../controllers/userController');
const authController = require('../../controllers/authController');
const { validations } = require('../../lib/utils');

module.exports = (router) => {
    /*
        -Functional:
        Changing profile description of blog user.

        -Usage:
        Made PUT request to "{hostname}/api/user/description" with request body.
        Request body contains 1 value: "newDescription".
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.
        Request must be authenticated. Don't forget for "Authorization: Bearer {some_token}" header.

        -Server validation:
        newDescription -> not less than 10 and not longer than 5000 symbols.

        -Success responce:
        msg: 'Description updated'.
        content: new description.

        -Potential errors:
        400(Validation error. See info about incorrect fields in response content)
        401(Authentication error. Incorrect token)
        500(Unknown: see more in response content)

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
        Made PUT request to "{hostname}/api/user/username" with request body.
        Request body contains 1 value: "newUsername".
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.
        Request must be authenticated. Don't forget for "Authorization: Bearer {some_token}" header.

        -Server validation:
        newUsername -> not empty and not email.

        -Success response:
        msg: 'Users username has been changed successful.
        content: new users data without hash password and new jwt token.

        -Potential errors:
        400(Validation error. See info about incorrect fields in response content)
           (New username not correct. The old and new username not different or user with this username already exists)
        401(Authentication error. Incorrect token)
        500(Unknown: see more in response content)

        -Example:
        PUT http://localhost:3000/api/user/username
        Content-Type: application/json
        Authorization: Bearer {token}

        {
           "newUsername": "Pineapple"
        }
    */
    router.put('/username', validations.username, authController.auth, controller.changeUsername);

    router.get('/verificate', controller.verificateEmail);

    router.post('/verificate/again', authController.auth, controller.sendVerificationAgain);

    /*
        -Functional:
        Delete user from blog. VERY DANGEROUS ENDPOINT!

        -Usage:
        Made DELETE request to "{hostname}/api/user/" with request body.
        Request body contains 2 values: "login" and "password".
        In body.login user can write username or email.
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.
        Request must be authenticated. Don't forget for "Authorization: Bearer {some_token}" header.

        -Success response:
        msg: 'User has been deleted'.
        content: deleted user data.

        -Potential errors:
        401(Authentication error. Incorrect token)
           (Username or password not correct)
        500(Unknown: see more in response content)

        -Example:
        DELETE  http://localhost:3000/api/user/
        Content-Type: application/json
        Authorization: Bearer {token}

        {
            "login": "MyUsername",  #(or test@gmail.com)
            "password": "12345678"
        }
    */
    router.delete('/', authController.auth, controller.deleteUser);
};
