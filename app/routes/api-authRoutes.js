const controller = require('../../controllers/authController');
const { validations } = require('../../lib/utils');

module.exports = (router) => {
    /*
        -Functional:
        Create new user, if his email already not use in blog.

        -Usage:
        Made POST request to "{hostname}/api/auth/registrate" with request body.
        Request body contains 3 values: "username", "email" and "password".
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.
        
        -Server validation:
        Username -> not empty and not email.
        Email -> must be email.
        Password -> not less than 8 symbols.

        -Success response:
        msg: 'User has been created'.
        content: users data without hash password and jwt token.

        -Potential errors:
        400(Validation error. See info about incorrect fields in response content)
        403(User with this email already exists)
        500(Unknown: see more in response content)

        -Example:
        POST http://localhost:3000/api/auth/registrate
        Content-Type: application/json

        {
            "username": "Destry",
            "email": "test@mail.ru",
            "password": "12345678"
        }
    */
    router.post('/registrate', validations.registration, controller.registration);

    /*
        -Functional:
        Authorization user in blog. In future user can authenticate without authorization.

        -Usage:
        Made POST request to "{hostname}/api/auth/login" with request body.
        Request body contains 2 values: "login" and "password".
        Request body type - JSON. Don't forget for "Content-Type: application/json" header. 
        In body.login user can write username or email.

        -Success response:
        msg: 'Loging in has been successful'.
        content: users data without hash password and jwt token.

        -Potential errors:
        401(Incorrect login or password. See more in response errorMsg)
        500(Unknown: see more in response content)

        -Example:
        POST http://localhost:3000/api/auth/login
        Content-Type: application/json

        {
            "login": "MyUsername",  #(or "login": "test@gmail.com")
            "password": "12345678"
        }
    */
    router.post('/login', controller.login);

    /*
        -Functional:
        Logout user from blog. For future autentication user will need authorize again.

        -Usage: 
        Made POST request to "{hostname}/api/auth/logout"

        -Success response:
        msg: 'Loging out has been successeful'.
        content: nothing.

        -Example:
        POST http://localhost:3000/api/auth/logout
    */
    router.post('/logout', controller.logout);
}