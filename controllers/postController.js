const User = require('../models/User');
const Post = require('../models/Post');

const config = require('../lib/config');
const { objects, validations, unknownError } = require('../lib/utils');

module.exports = {
    async writeNewPost(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser } = req.body;
        }
        catch (err) {
            unknownError(req, err);
        }
    },
    async likePost(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser } = req.body;
        }
        catch (err) {
            unknownError(req, err);
        }
    },
    async dislikePost(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser } = req.body;
        }
        catch (err) {
            unknownError(req, err);
        }
    },
    async commentPost(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser } = req.body;
        }
        catch (err) {
            unknownError(req, err);
        }
    },
    async editPost(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser } = req.body;
        }
        catch (err) {
            unknownError(req, err);
        }
    },
    async deletePost(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser } = req.body;
        }
        catch (err) {
            unknownError(req, err);
        }
    },
};
