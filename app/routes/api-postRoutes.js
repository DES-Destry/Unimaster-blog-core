const controller = require('../../controllers/postController');
const authController = require('../../controllers/authController');

module.exports = (router) => {
    router.post('/', authController.auth, controller.writeNewPost);
    router.put('/', authController.auth, controller.editPost);
    router.delete('/');

    router.put('/like', authController.auth, controller.likePost);
    router.put('/dislike', authController.auth, controller.dislikePost);
    router.put('/comment', authController.auth, controller.commentPost);
};
