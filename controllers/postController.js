const mongoose = require('mongoose');

const User = require('../models/User');
const Post = require('../models/Post');

const { objects, validations, unknownError } = require('../lib/utils');

module.exports = {
    async writeNewPost(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const {
                currentUser,
                title,
                content,
                description,
                tags,
            } = req.body;

            if (!currentUser.verified) {
                response.success = false;
                response.msg = 'Access denied. User not verificated';

                res.status(403).json(response);
                return;
            }

            const newPost = new Post(title, content);
            newPost.description = description || '';
            newPost.tags = tags || [];
            newPost.writer = currentUser._id;
            newPost.save();

            response.success = true;
            response.msg = 'New post has been uploaded!';

            res.json(response);
        }
        catch (err) {
            unknownError(req, err);
        }
    },
    async likePost(req, res) {
        const response = Object.create(objects.serverResponse);
        const session = mongoose.startSession();

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser, postId } = req.body;
            const post = await Post.findById(postId).populate('writer');
            const writerCurrentScore = post.writer.score;

            if (post.likes.includes(currentUser._id)) {
                await Post.findByIdAndUpdate(postId, {
                    $pullAll: {
                        likes: currentUser._id,
                    },
                }).session(session);

                await User.findByIdAndUpdate(post.writer._id, {
                    $set: {
                        score: writerCurrentScore - 1,
                    },
                }).session(session);
            }
            else if (post.dislikes.includes(currentUser._id)) {
                await Post.findByIdAndUpdate(postId, {
                    $pullAll: {
                        dislikes: currentUser._id,
                    },
                }).session(session);
                await Post.findByIdAndUpdate(postId, {
                    $push: {
                        likes: currentUser._id,
                    },
                }).session(session);

                await User.findByIdAndUpdate(post.writer._id, {
                    $set: {
                        score: writerCurrentScore + 2,
                    },
                }).session(session);
            }
            else {
                await Post.findByIdAndUpdate(postId, {
                    $push: {
                        likes: currentUser._id,
                    },
                }).session(session);

                await User.findByIdAndUpdate(post.writer._id, {
                    $set: {
                        score: writerCurrentScore + 1,
                    },
                }).session(session);
            }

            await session.commitTransaction();

            response.success = true;
            response.msg = 'Post has been liked';

            res.json(response);
        }
        catch (err) {
            await session.abortTransaction();
            unknownError(req, err);
        }
        finally {
            session.endSession();
        }
    },
    async dislikePost(req, res) {
        const response = Object.create(objects.serverResponse);
        const session = mongoose.startSession();

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser, postId } = req.body;
            const post = await Post.findById(postId).populate('writer');
            const writerCurrentScore = post.writer.score;

            if (post.dislikes.includes(currentUser._id)) {
                await Post.findByIdAndUpdate(postId, {
                    $pullAll: {
                        dislikes: currentUser._id,
                    },
                }).session(session);

                await User.findByIdAndUpdate(post.writer._id, {
                    $set: {
                        score: writerCurrentScore + 1,
                    },
                }).session(session);
            }
            else if (post.likes.includes(currentUser._id)) {
                await Post.findByIdAndUpdate(postId, {
                    $pullAll: {
                        likes: currentUser._id,
                    },
                }).session(session);
                await Post.findByIdAndUpdate(postId, {
                    $push: {
                        dislikes: currentUser._id,
                    },
                }).session(session);

                await User.findByIdAndUpdate(post.writer._id, {
                    $set: {
                        score: writerCurrentScore - 2,
                    },
                }).session(session);
            }
            else {
                await Post.findByIdAndUpdate(postId, {
                    $push: {
                        dislikes: currentUser._id,
                    },
                }).session(session);

                await User.findByIdAndUpdate(post.writer._id, {
                    $set: {
                        score: writerCurrentScore - 1,
                    },
                }).session(session);
            }

            await session.commitTransaction();

            response.success = true;
            response.msg = 'Post has been liked';

            res.json(response);
        }
        catch (err) {
            await session.abortTransaction();
            unknownError(req, err);
        }
        finally {
            session.endSession();
        }
    },
    async commentPost(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser, postId, content } = req.body;

            await Post.findByIdAndUpdate(postId, {
                $push: {
                    comment: {
                        user: currentUser._id,
                        content,
                    },
                },
            });

            response.success = true;
            response.msg = 'Comment has been writed';

            res.json(response);
        }
        catch (err) {
            unknownError(req, err);
        }
    },
    async editPost(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser, postId } = req.body;
            let {
                title,
                content,
                description,
                tags,
            } = req.body;
            const post = await Post.findById(postId);

            if (!currentUser._id.equals(post.writer)) {
                response.success = false;
                response.msg = 'Access denied. You are not owner of this post';

                res.status(403).json(response);
                return;
            }

            title = title || post.title;
            content = content || post.content;
            description = description || post.description;
            tags = tags || post.tags;

            await Post.findByIdAndUpdate(postId, {
                $set: {
                    title,
                    content,
                    description,
                    tags,
                },
            });

            response.success = true;
            response.msg = 'Post has been updated';

            res.json(response);
        }
        catch (err) {
            unknownError(req, err);
        }
    },
    async deletePost(req, res) {
        const response = Object.create(objects.serverResponse);

        try {
            if (validations.validateInput(req, res)) return;

            const { currentUser, postId } = req.body;
            const post = await Post.findById(postId);

            if (!currentUser._id.equals(post.writer)) {
                response.success = false;
                response.msg = 'Access denied. You are not owner of this post';

                res.status(403).json(response);
                return;
            }

            await Post.findByIdAndDelete(postId);

            response.success = true;
            response.msg = 'Post has been deleted';

            res.json(response);
        }
        catch (err) {
            unknownError(req, err);
        }
    },
};
