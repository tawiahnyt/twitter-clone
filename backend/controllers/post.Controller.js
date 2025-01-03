/** @format */

import Notification from "../models/notification.Model.js";
import Post from "../models/post.Model.js";
import User from "../models/user.Model.js";

import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ message: "User does not exist" });

    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    if (img) {
      const uploadResponse = await cloudinary.uploader.upload(img);
      img = uploadResponse.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });

    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("Error in createPost controller:", error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "User not authorized" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split;
      await cloudinary.uploader.destroy(imgId);
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("Error in deletePost controller:", error);
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id.toString();

    if (!text) {
      return res.status(400).json({ error: "Comment must have text" });
    }
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comment = {
      text,
      user: userId,
    };

    post.comments.push(comment);
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("Error in commentOnPost controller:", error);
  }
};

export const likeUnlikePost = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { id: postId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      // unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      // like post
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("Error in likeUnlikePost controller:", error);
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("Error in getAllPosts controller:", error);
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.user._id.toString();

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json(likedPosts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("Error in getLikedPosts controller:", error);
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = user.following;

    const feedPosts = await Post.find({ user: { $in: following } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" })
      .sort({ createdAt: -1 });

    res.status(200).json(feedPosts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("Error in getFollowingPosts controller:", error);
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const posts = await Post.find({ user: user._id })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.log("Error in getUserPosts controller:", error);
  }
};
