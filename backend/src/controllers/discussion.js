/**
 * @fileoverview Discussion Forum Controller
 * Handles all discussion room, post, comment, and trending operations.
 * 
 * @module controllers/discussion
 */

import DiscussionRoom from "../models/discussionRoom.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import Hashtag from "../models/hashtag.js";
import User from "../models/user.js";
import uploadImageToCloudinary from "../utils/imageUploader.js";

/* ==================== Discussion Rooms ==================== */

/**
 * Auto-categorize hashtags based on keywords
 * @param {string} tag - The hashtag to categorize
 * @returns {string} Category: CAREER, NETWORK, CULTURE, or GENERAL
 */
const categorizeHashtag = (tag) => {
    const lowercaseTag = tag.toLowerCase();
    
    // Career-related keywords
    const careerKeywords = ['career', 'job', 'hiring', 'interview', 'resume', 'salary', 'promotion', 'work', 'professional', 'leadership', 'management', 'startup', 'entrepreneur', 'fintech', 'tech', 'engineering', 'developer', 'internship', 'opportunity', 'vacancy', 'recruitment', 'skills', 'mentor', 'mentorship'];
    
    // Network-related keywords
    const networkKeywords = ['alumni', 'connect', 'reunion', 'meetup', 'network', 'networking', 'community', 'batch', 'meet', 'event', 'celebration', 'gathering'];
    
    // Culture/Nostalgia-related keywords
    const cultureKeywords = ['memories', 'nostalgia', 'throwback', 'jnv', 'jnvmemories', 'schooldays', 'hostel', 'mess', 'sports', 'cultural', 'fest', 'nesmo', 'navodaya'];
    
    if (careerKeywords.some(kw => lowercaseTag.includes(kw))) return 'CAREER';
    if (networkKeywords.some(kw => lowercaseTag.includes(kw))) return 'NETWORK';
    if (cultureKeywords.some(kw => lowercaseTag.includes(kw))) return 'CULTURE';
    
    return 'GENERAL';
};

/**
 * Default discussion rooms to seed
 */
const defaultRooms = [
    { name: "Medical Help", slug: "medical-help", description: "Medical queries and health discussions", icon: "🏥", color: "#EF4444", order: 1 },
    { name: "Career Advice", slug: "career-advice", description: "Get career guidance and professional tips", icon: "💼", color: "#3B82F6", order: 2 },
    { name: "Professional", slug: "professional", description: "Professional networking and discussions", icon: "👔", color: "#8B5CF6", order: 3 },
    { name: "NESMO News", slug: "nesmo-news", description: "Latest news and updates from NESMO", icon: "📰", color: "#10B981", order: 4 },
    { name: "JNV Memories", slug: "jnv-memories", description: "Share your nostalgic JNV moments", icon: "💛", color: "#F59E0B", order: 5 }
];

/**
 * Get all active discussion rooms
 * GET /api/discussions/rooms
 * Auto-seeds default rooms if none exist
 */
export const getRooms = async (req, res) => {
    try {
        let rooms = await DiscussionRoom.find({ isActive: true })
            .sort({ order: 1, name: 1 });
        
        // Auto-seed default rooms if none exist
        if (rooms.length === 0) {
            console.log("No discussion rooms found, seeding defaults...");
            // Use create() to trigger pre-save hooks for slug generation
            await DiscussionRoom.insertMany(defaultRooms);
            rooms = await DiscussionRoom.find({ isActive: true })
                .sort({ order: 1, name: 1 });
        }
        
        res.status(200).json({
            success: true,
            data: rooms
        });
    } catch (error) {
        console.error("Error fetching rooms:", error);
        res.status(500).json({ message: "Failed to fetch discussion rooms" });
    }
};

/**
 * Create a new discussion room (Admin only)
 * POST /api/discussions/rooms
 */
export const createRoom = async (req, res) => {
    try {
        const { name, description, icon, color, order } = req.body;

        const room = await DiscussionRoom.create({
            name,
            description,
            icon,
            color,
            order
        });

        res.status(201).json({
            success: true,
            message: "Discussion room created successfully",
            data: room
        });
    } catch (error) {
        console.error("Error creating room:", error);
        if (error.code === 11000) {
            return res.status(400).json({ message: "A room with this name already exists" });
        }
        res.status(500).json({ message: "Failed to create discussion room" });
    }
};

/**
 * Seed default discussion rooms (Admin only)
 * POST /api/discussions/rooms/seed
 * Clears existing rooms and creates fresh ones
 */
export const seedRooms = async (req, res) => {
    try {
        // Clear all existing rooms first
        await DiscussionRoom.deleteMany({});

        // Use the same defaultRooms defined at the top
        for (const room of defaultRooms) {
            await DiscussionRoom.create(room);
        }

        const rooms = await DiscussionRoom.find({ isActive: true }).sort({ order: 1 });

        res.status(200).json({
            success: true,
            message: "Default rooms seeded successfully",
            data: rooms
        });
    } catch (error) {
        console.error("Error seeding rooms:", error);
        res.status(500).json({ message: "Failed to seed discussion rooms" });
    }
};

/* ==================== Posts ==================== */

/**
 * Get posts feed with pagination
 * GET /api/discussions/posts
 * Query params: roomId, page, limit
 */
export const getPosts = async (req, res) => {
    try {
        const { roomId, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = { isActive: true };
        if (roomId) {
            query.room = roomId;
        }

        const posts = await Post.find(query)
            .populate({
                path: "author",
                select: "firstName lastName role",
                populate: {
                    path: "profile",
                    select: "profilePhoto batch"
                }
            })
            .populate("room", "name slug icon color")
            .sort({ isPinned: -1, createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Post.countDocuments(query);

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ message: "Failed to fetch posts" });
    }
};

/**
 * Get single post by ID
 * GET /api/discussions/posts/:id
 */
export const getPostById = async (req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id, isActive: true })
            .populate({
                path: "author",
                select: "firstName lastName role",
                populate: {
                    path: "profile",
                    select: "profilePhoto batch"
                }
            })
            .populate("room", "name slug icon color");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error("Error fetching post:", error);
        res.status(500).json({ message: "Failed to fetch post" });
    }
};

/**
 * Create a new post
 * POST /api/discussions/posts
 */
export const createPost = async (req, res) => {
    try {
        const { roomId, content, hashtags, poll } = req.body;

        // Validate room exists
        const room = await DiscussionRoom.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: "Discussion room not found" });
        }

        // Handle image uploads
        let images = [];
        if (req.files && req.files.images) {
            const imageFiles = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            for (const file of imageFiles) {
                const result = await uploadImageToCloudinary(file, "discussion-posts");
                images.push(result.secure_url);
            }
        }

        // Parse hashtags from content if not provided
        let hashtagList = hashtags ? (Array.isArray(hashtags) ? hashtags : JSON.parse(hashtags)) : [];
        const contentTags = content ? content.match(/#(\w+)/g) : [];
        if (contentTags) {
            const extractedTags = contentTags.map(tag => tag.slice(1).toLowerCase());
            hashtagList = [...new Set([...hashtagList, ...extractedTags])];
        }

        // Parse poll if provided
        let pollData = null;
        if (poll) {
            pollData = typeof poll === "string" ? JSON.parse(poll) : poll;
        }

        const post = await Post.create({
            author: req.user.id,
            room: roomId,
            content,
            images,
            hashtags: hashtagList,
            poll: pollData
        });

        // Update room post count
        await DiscussionRoom.findByIdAndUpdate(roomId, { $inc: { postCount: 1 } });

        // Update hashtag statistics with auto-categorization
        for (const tag of hashtagList) {
            const category = categorizeHashtag(tag);
            await Hashtag.findOneAndUpdate(
                { tag },
                { 
                    $inc: { useCount: 1, weeklyCount: 1 },
                    $set: { lastUsed: new Date(), category }
                },
                { upsert: true }
            );
        }

        // Populate and return
        const populatedPost = await Post.findById(post._id)
            .populate({
                path: "author",
                select: "firstName lastName role",
                populate: {
                    path: "profile",
                    select: "profilePhoto batch"
                }
            })
            .populate("room", "name slug icon color");

        res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: populatedPost
        });
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(500).json({ message: "Failed to create post" });
    }
};

/**
 * Update a post
 * PUT /api/discussions/posts/:id
 */
export const updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check ownership
        if (post.author.toString() !== req.user.id && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not authorized to update this post" });
        }

        const { content, hashtags } = req.body;

        if (content) post.content = content;
        if (hashtags) post.hashtags = Array.isArray(hashtags) ? hashtags : JSON.parse(hashtags);

        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate({
                path: "author",
                select: "firstName lastName role",
                populate: {
                    path: "profile",
                    select: "profilePhoto batch"
                }
            })
            .populate("room", "name slug icon color");

        res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: populatedPost
        });
    } catch (error) {
        console.error("Error updating post:", error);
        res.status(500).json({ message: "Failed to update post" });
    }
};

/**
 * Delete a post (soft delete)
 * DELETE /api/discussions/posts/:id
 */
export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Check ownership - only author or ADMIN can delete
        const isAuthor = post.author.toString() === req.user.id.toString();
        if (!isAuthor && req.user.role !== "ADMIN") {
            return res.status(403).json({ message: "Not authorized to delete this post" });
        }

        post.isActive = false;
        await post.save();

        // Decrement room post count
        await DiscussionRoom.findByIdAndUpdate(post.room, { $inc: { postCount: -1 } });

        res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting post:", error);
        res.status(500).json({ message: "Failed to delete post" });
    }
};

/**
 * Like/Unlike a post
 * POST /api/discussions/posts/:id/like
 */
export const toggleLikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post || !post.isActive) {
            return res.status(404).json({ message: "Post not found" });
        }

        const userId = req.user.id;
        const hasLiked = post.likes.includes(userId);

        if (hasLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: hasLiked ? "Post unliked" : "Post liked",
            data: {
                liked: !hasLiked,
                likeCount: post.likes.length
            }
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ message: "Failed to toggle like" });
    }
};

/**
 * Vote on a poll option
 * POST /api/discussions/posts/:id/vote
 */
export const votePoll = async (req, res) => {
    try {
        const { optionId } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post || !post.isActive) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (!post.poll || !post.poll.options || post.poll.options.length === 0) {
            return res.status(400).json({ message: "This post doesn't have a poll" });
        }

        // Check if poll has expired
        if (post.poll.expiresAt && new Date() > post.poll.expiresAt) {
            return res.status(400).json({ message: "This poll has expired" });
        }

        const userId = req.user.id.toString();

        // Find the option being voted on
        const option = post.poll.options.id(optionId);
        if (!option) {
            return res.status(404).json({ message: "Poll option not found" });
        }

        // Check if user already voted on THIS option
        const hasVotedThisOption = option.votes.some(id => id.toString() === userId);

        if (hasVotedThisOption) {
            // Remove vote from this option (unvote)
            option.votes = option.votes.filter(id => id.toString() !== userId);
        } else {
            // If not allowing multiple, remove vote from other options first
            if (!post.poll.allowMultiple) {
                post.poll.options.forEach(opt => {
                    opt.votes = opt.votes.filter(id => id.toString() !== userId);
                });
            }
            // Add vote to this option
            option.votes.push(req.user.id);
        }

        await post.save();

        res.status(200).json({
            success: true,
            message: hasVotedThisOption ? "Vote removed" : "Vote recorded",
            data: post.poll
        });
    } catch (error) {
        console.error("Error voting on poll:", error);
        res.status(500).json({ message: "Failed to record vote" });
    }
};

/* ==================== Comments ==================== */

/**
 * Get comments for a post
 * GET /api/discussions/posts/:postId/comments
 */
export const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get top-level comments (no parent)
        const comments = await Comment.find({ 
            post: postId, 
            isActive: true,
            parentComment: null 
        })
            .populate({
                path: "author",
                select: "firstName lastName role",
                populate: {
                    path: "profile",
                    select: "profilePhoto batch"
                }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Comment.countDocuments({ 
            post: postId, 
            isActive: true,
            parentComment: null 
        });

        res.status(200).json({
            success: true,
            data: comments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Failed to fetch comments" });
    }
};

/**
 * Get replies for a comment
 * GET /api/discussions/comments/:commentId/replies
 */
export const getReplies = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const replies = await Comment.find({ 
            parentComment: commentId, 
            isActive: true 
        })
            .populate({
                path: "author",
                select: "firstName lastName role",
                populate: {
                    path: "profile",
                    select: "profilePhoto batch"
                }
            })
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Comment.countDocuments({ 
            parentComment: commentId, 
            isActive: true 
        });

        res.status(200).json({
            success: true,
            data: replies,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Error fetching replies:", error);
        res.status(500).json({ message: "Failed to fetch replies" });
    }
};

/**
 * Create a comment or reply
 * POST /api/discussions/posts/:postId/comments
 */
export const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content, parentCommentId } = req.body;

        const post = await Post.findById(postId);
        if (!post || !post.isActive) {
            return res.status(404).json({ message: "Post not found" });
        }

        // Validate parent comment if it's a reply
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (!parentComment || !parentComment.isActive) {
                return res.status(404).json({ message: "Parent comment not found" });
            }
        }

        const comment = await Comment.create({
            post: postId,
            author: req.user.id,
            content,
            parentComment: parentCommentId || null
        });

        // Update post comment count
        await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

        // Update parent comment reply count if this is a reply
        if (parentCommentId) {
            await Comment.findByIdAndUpdate(parentCommentId, { $inc: { replyCount: 1 } });
        }

        const populatedComment = await Comment.findById(comment._id)
            .populate({
                path: "author",
                select: "firstName lastName role",
                populate: {
                    path: "profile",
                    select: "profilePhoto batch"
                }
            });

        res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: populatedComment
        });
    } catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ message: "Failed to create comment" });
    }
};

/**
 * Delete a comment (soft delete)
 * DELETE /api/discussions/comments/:id
 * Can be deleted by: comment author, post author, or admin
 */
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Get the post to check if user is the post author
        const post = await Post.findById(comment.post);
        
        // Handle author comparison - author could be ObjectId or populated object
        const commentAuthorId = comment.author._id ? comment.author._id.toString() : comment.author.toString();
        const postAuthorId = post?.author._id ? post.author._id.toString() : post?.author?.toString();
        const currentUserId = req.user.id.toString();
        
        const isCommentAuthor = commentAuthorId === currentUserId;
        const isPostAuthor = post && postAuthorId === currentUserId;
        const isAdmin = req.user.role === "ADMIN";

        // Check authorization: comment author, post author, or admin can delete
        if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
            return res.status(403).json({ message: "Not authorized to delete this comment" });
        }

        comment.isActive = false;
        await comment.save();

        // Decrement post comment count
        await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

        // Decrement parent comment reply count if this was a reply
        if (comment.parentComment) {
            await Comment.findByIdAndUpdate(comment.parentComment, { $inc: { replyCount: -1 } });
        }

        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting comment:", error);
        res.status(500).json({ message: "Failed to delete comment" });
    }
};

/**
 * Like/Unlike a comment
 * POST /api/discussions/comments/:id/like
 */
export const toggleLikeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment || !comment.isActive) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const userId = req.user.id;
        const hasLiked = comment.likes.includes(userId);

        if (hasLiked) {
            comment.likes = comment.likes.filter(id => id.toString() !== userId);
        } else {
            comment.likes.push(userId);
        }

        await comment.save();

        res.status(200).json({
            success: true,
            message: hasLiked ? "Comment unliked" : "Comment liked",
            data: {
                liked: !hasLiked,
                likeCount: comment.likes.length
            }
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ message: "Failed to toggle like" });
    }
};

/* ==================== Trending & Suggestions ==================== */

/**
 * Get trending hashtags
 * GET /api/discussions/trending
 */
export const getTrending = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get all hashtags and auto-recategorize any that are still GENERAL
        const allHashtags = await Hashtag.find();
        for (const hashtag of allHashtags) {
            const correctCategory = categorizeHashtag(hashtag.tag);
            if (hashtag.category !== correctCategory) {
                hashtag.category = correctCategory;
                await hashtag.save();
            }
        }

        const trending = await Hashtag.find()
            .sort({ weeklyCount: -1, useCount: -1 })
            .limit(parseInt(limit));

        // Group by category
        const grouped = {
            CAREER: [],
            NETWORK: [],
            CULTURE: [],
            GENERAL: []
        };

        trending.forEach(tag => {
            if (grouped[tag.category]) {
                grouped[tag.category].push(tag);
            }
        });

        res.status(200).json({
            success: true,
            data: { trending, grouped }
        });
    } catch (error) {
        console.error("Error fetching trending:", error);
        res.status(500).json({ message: "Failed to fetch trending hashtags" });
    }
};

/**
 * Get posts by hashtag
 * GET /api/discussions/hashtag/:tag
 */
export const getPostsByHashtag = async (req, res) => {
    try {
        const { tag } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const posts = await Post.find({ 
            hashtags: tag.toLowerCase(), 
            isActive: true 
        })
            .populate({
                path: "author",
                select: "firstName lastName role",
                populate: {
                    path: "profile",
                    select: "profilePhoto batch"
                }
            })
            .populate("room", "name slug icon color")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Post.countDocuments({ 
            hashtags: tag.toLowerCase(), 
            isActive: true 
        });

        // Update hashtag view count
        await Hashtag.findOne({ tag: tag.toLowerCase() });

        res.status(200).json({
            success: true,
            data: posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error("Error fetching posts by hashtag:", error);
        res.status(500).json({ message: "Failed to fetch posts" });
    }
};

/**
 * Get alumni suggestions for "Connect with Alumni"
 * GET /api/discussions/suggestions
 */
export const getAlumniSuggestions = async (req, res) => {
    try {
        const { limit = 5 } = req.query;
        const currentUserId = req.user.id;

        // Get random active users excluding current user
        const suggestions = await User.aggregate([
            { 
                $match: { 
                    _id: { $ne: currentUserId },
                    status: "ACTIVE",
                    isEmailVerified: true
                }
            },
            { $sample: { size: parseInt(limit) } },
            {
                $lookup: {
                    from: "profiles",
                    localField: "profile",
                    foreignField: "_id",
                    as: "profileData"
                }
            },
            { $unwind: { path: "$profileData", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    role: 1,
                    "profileData.profilePhoto": 1,
                    "profileData.batch": 1,
                    "profileData.currentPosition": 1,
                    "profileData.currentCompany": 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: suggestions
        });
    } catch (error) {
        console.error("Error fetching suggestions:", error);
        res.status(500).json({ message: "Failed to fetch suggestions" });
    }
};

/**
 * Share a post (increment share count)
 * POST /api/discussions/posts/:id/share
 */
export const sharePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { shareCount: 1 } },
            { new: true }
        );

        if (!post || !post.isActive) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({
            success: true,
            message: "Post shared",
            data: { shareCount: post.shareCount }
        });
    } catch (error) {
        console.error("Error sharing post:", error);
        res.status(500).json({ message: "Failed to share post" });
    }
};

/**
 * Seed default hashtags and recategorize existing ones (Admin only)
 * POST /api/discussions/hashtags/seed
 */
export const seedHashtags = async (req, res) => {
    try {
        // First, recategorize all existing hashtags
        const existingHashtags = await Hashtag.find();
        for (const hashtag of existingHashtags) {
            const newCategory = categorizeHashtag(hashtag.tag);
            if (hashtag.category !== newCategory) {
                hashtag.category = newCategory;
                await hashtag.save();
            }
        }

        const defaultHashtags = [
            { tag: "upskilling2024", category: "CAREER", weeklyCount: 245 },
            { tag: "bangaloremeetup", category: "NETWORK", weeklyCount: 89 },
            { tag: "messfoodstories", category: "CULTURE", weeklyCount: 156 },
            { tag: "jnvreunion", category: "NETWORK", weeklyCount: 120 },
            { tag: "careerswitch", category: "CAREER", weeklyCount: 78 },
            { tag: "techcareers", category: "CAREER", weeklyCount: 95 },
            { tag: "alumninetwork", category: "NETWORK", weeklyCount: 67 }
        ];

        for (const hashtag of defaultHashtags) {
            await Hashtag.findOneAndUpdate(
                { tag: hashtag.tag },
                { ...hashtag, useCount: hashtag.weeklyCount * 2 },
                { upsert: true }
            );
        }

        res.status(200).json({
            success: true,
            message: `Recategorized ${existingHashtags.length} hashtags and seeded defaults`
        });
    } catch (error) {
        console.error("Error seeding hashtags:", error);
        res.status(500).json({ message: "Failed to seed hashtags" });
    }
};
