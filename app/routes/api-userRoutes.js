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
        msg: 'Users username has been changed successful.'
        content: new jwt token.

        -Potential errors:
        400(Validation error. See info about incorrect fields in response content)
        401(Authentication error. Incorrect token)
        403(User with this username already exist or user change username 30 days ago or earler)
        418(New username not correct. The old and new username not different)
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

        /*
        -Functional:
        Changing profile alias of blog user.

        -Usage:
        Made PUT request to "{hostname}/api/user/alias" with request body.
        Request body contains 1 value: "newAlias".
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.
        Request must be authenticated. Don't forget for "Authorization: Bearer {some_token}" header.

        -Server validation:
        newAlias -> not longer than 20 symbols.

        -Success response:
        msg: 'Users alias has been changed successful'
        content: nothing.

        -Potential errors:
        400(Validation error. See info about incorrect fields in response content)
        401(Authentication error. Incorrect token)
        418(New alias and old are same)
        500(Unknown: see more in response content)

        -Example:
        PUT http://localhost:3000/api/user/alias
        Content-Type: application/json
        Authorization: Bearer {token}

        {
           "newAlias": "Banana"
        }
    */
    router.put('/alias', validations.alias, authController.auth, controller.changeAlias);

    /*
        -Functional:
        Changing location name of blog user.

        -Usage:
        Made PUT request to "{hostname}/api/user/location" with request body.
        Request body contains 1 value: "newLocation".
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.
        Request must be authenticated. Don't forget for "Authorization: Bearer {some_token}" header.

        -Server validation:
        newLocation -> not longer than 20 symbols.

        -Success response:
        msg: 'User location has been changed successful'
        content: nothing.

        -Potential errors:
        400(Validation error. See info about incorrect fields in response content)
        401(Authentication error. Incorrect token)
        500(Unknown: see more in response content)

        -Example:
        PUT http://localhost:3000/api/user/location
        Content-Type: application/json
        Authorization: Bearer {token}

        {
           "newLocation": "North Korea"
        }
    */
    router.put('/location', validations.location, authController.auth, controller.changeLocation);

    /*
        -Functional:
        Changing privilege of another user(if you have privilege for it).

        -Usage:
        Made PUT request to "{hostname}/api/user/privilege" with request body.
        Request body contains 2 values: "usernameToSet", "newPrivilege".
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.
        Request must be authenticated. Don't forget for "Authorization: Bearer {some_token}" header.

        -Server validation:
        newPrivilege -> not be empty and this privelegy must exists in blog.
        usernameToSet -> not be empty and this user must exists in blog.

        -Success response:
        msg: 'User's ${usernameToSet} privilege has been changed successful'
        content: nothing.

        -Potential errors:
        400(Validation error. See info about incorrect fields in response content)
        401(Authentication error. Incorrect token)
        403(If privilege to set higher than current user privilege or if privilege to set depends on user score)
        500(Unknown: see more in response content)

        -Example:
        PUT http://localhost:3000/api/user/privilege
        Content-Type: application/json
        Authorization: Bearer {token}

        {
           "newLocation": "North Korea"
        }
    */
    router.put('/privilege', validations.privilegy, authController.auth, controller.setPrivilege);

    /*
        -Functional:
        Rewrite all users links

        -Usage:
        Made POST request to "{hostname}/api/user/links" with request body.
        Request body contains 1 value: "links".
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.
        Request must be authenticated. Don't forget for "Authorization: Bearer {some_token}" header.

        -Server validation:
        links -> must be an array

        -Success response:
        msg: "User's links rewrited successful"
        content: nothing.

        -Potential errors:
        400(Validation error. See info about incorrect fields in response content)
        401(Authentication error. Incorrect token)
        500(Unknown: see more in response content)

        -Example:
        POST http://localhost:3000/api/user/links
        Content-Type: application/json
        Authorization: Bearer {token}

        {
           [
               {
                   "site": "YouTube",
                   "link": "youtube.com/..."
               },
               {
                   "site": "Telegram",
                   "link": "..."
               }
           ]
        }
    */
    router.post('/links', validations.links, authController.auth, controller.rewriteLinks);

    // Not in use yet
    router.put('/avatar', (req, res) => res.send('Not in use yet'));
    // Not in use yet
    router.delete('/avatar', (req, res) => res.send('Not in use yet'));

    /*
        -Functional:
        Change users password if old password known by user.

        -Usage:
        Made PUT request to "{hostname}/api/user/password" with request body.
        Request body contains 2 values: "oldPassword", "newPassword".
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.
        Request must be authenticated. Don't forget for "Authorization: Bearer {some_token}" header.

        -Server validation:
        oldPassword -> not be empty.
        newPassword -> must be longer than 8 symbols.

        -Success response:
        msg: 'Password has been changed'
        content: new jwt token.

        -Potential errors:
        400(Validation error. See info about incorrect fields in response content)
        401(Authentication error. Incorrect token)
        403(If old password not correct or user not verified by email)
        500(Unknown: see more in response content)

        -Example:
        PUT http://localhost:3000/api/user/password
        Content-Type: application/json
        Authorization: Bearer {token}

        {
           "oldPassword": "123456789",
           "newPassword": "987654321"
        }
    */
    router.put('/password', validations.changePassword, authController.auth, controller.changePassword);

    /*
        -Functional:
        Send request to change users password if old password not known by user.
        Send restore code to users email.

        -Usage:
        Made POST request to "{hostname}/api/user/password/restore/codeRequest" with request body.
        Request body contains 1 value: "login".
        In body.login user can write username or email.
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.

        -Success response:
        msg: 'Restore code has been sended. Check email'
        content: nothing.

        -Potential errors:
        400(User with this login not exists)
        500(Unknown: see more in response content)

        -Example:
        POST http://localhost:3000/api/user/password/restore/codeRequest
        Content-Type: application/json

        {
            "login": "Destry" (or email)
        }
    */
    router.post('/password/restore/codeRequest', controller.restorePasswordRequest);

    /*
        -Functional:
        Check restore code for user.

        -Usage:
        Made GET request to "{hostname}/api/user/password/restore/check" with request body.
        Request body contains 2 values: "login", "code".
        In body.login user can write username or email.
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.

        -Success response:
        msg: 'Code avaiable for this user'
        content: nothing.

        -Potential errors:
        403(This code not avaiable for this login)
        500(Unknown: see more in response content)

        -Example:
        GET http://localhost:3000/api/user/password/restore/check
        Content-Type: application/json

        {
            "login": "Destry", (or email)
            "code": "000000"
        }
    */
    router.get('/password/restore/check', controller.checkRestoreCode);

    /*
        -Functional:
        Change users password using restore code.

        -Usage:
        Made PUT request to "{hostname}/api/user/password/restore" with request body.
        Request body contains 3 values: "login", "code", "newPassword".
        In body.login user can write username or email.
        Request body type - JSON. Don't forget for "Content-Type: application/json" header.

        -Success response:
        msg: 'Password has been changed'
        content: new jwt token.

        -Potential errors:
        403(This code not avaiable for this login)
        500(Unknown: see more in response content)

        -Example:
        PUT http://localhost:3000/api/user/password/restore
        Content-Type: application/json

        {
            "login": "Destry", (or email)
            "code": "000000",
            "newPassword": "987654321"
        }
    */
    router.put('/password/restore', validations.restorePassword, controller.restorePassword);

    /*
        -Functional:
        Activate user profile by email.
        This endpoint can use in browser for activate.

        -Usage:
        Made GET request to "{hostname}/api/user/verificate?code={code}" with request body.

        -Success response:
        Html page with status.

        -Example:
        GET http://localhost:3000/api/user/varificate?code={code}
    */
    router.get('/verificate', controller.verificateEmail);

    /*
        -Functional:
        Send verification email again.

        -Usage:
        Made POST request to "{hostname}/api/user/verificate/again".
        Request must be authenticated. Don't forget for "Authorization: Bearer {some_token}" header.

        -Success response:
        msg: 'Verification code has been sended again'
        content: nothing.

        -Potential errors:
        208(Not an error. User already verified. Nothing changed.)
        403(User can send request only once per 10 munutes. In content will place time left in seconds.)
        500(Unknown: see more in response content)

        -Example:
        POST http://localhost:3000/api/user/verificate/again
        Authorization: Bearer {token}
    */
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
