const Post = require('../models/Post');

// @desc    Get all posts (with optional pagination)
// @route   GET /api/posts
// @access  Public
const getPosts = (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = Post.find({ skip, limit });
    const total = Post.countDocuments();

    res.status(200).json({
      posts,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
const getPostById = (req, res) => {
  try {
    const post = Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a post
// @route   POST /api/posts
// @access  Private/Admin
const createPost = (req, res) => {
  try {
    const { title, content, image, tags } = req.body;
    const post = Post.create({ title, content, image, tags });
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private/Admin
const updatePost = (req, res) => {
  try {
    const { title, content, image, tags } = req.body;

    const post = Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const updated = Post.update(req.params.id, { title, content, image, tags });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private/Admin
const deletePost = (req, res) => {
  try {
    const post = Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    Post.delete(req.params.id);
    res.status(200).json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
};

