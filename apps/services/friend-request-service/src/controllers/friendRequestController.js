const mongoose = require('mongoose');
const FriendRequest = require('../models/FriendRequest');
const Friendship = require('../models/Friendship');
const { redisUtils } = require('../config/redis');
const jwt = require('jsonwebtoken');

// Send a friend request
const sendFriendRequest = async (req, res) => {
  try {
    // Extract sender ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const senderId = decoded.userId;
      const { receiverId, message } = req.body;
      
      // Validate input
      if (!receiverId) {
        return res.status(400).json({ message: 'Receiver ID is required' });
      }
      
      // Check if users are trying to send request to themselves
      if (senderId === receiverId) {
        return res.status(400).json({ message: 'Cannot send friend request to yourself' });
      }
      
      // Check if there's already a friend request between these users
      const existingRequest = await FriendRequest.findOne({
        $or: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId }
        ]
      });
      
      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          return res.status(409).json({ message: 'Friend request already exists' });
        }
      }
      
      // Check if they are already friends
      const existingFriendship = await Friendship.findOne({
        $or: [
          { userId1: senderId, userId2: receiverId },
          { userId1: receiverId, userId2: senderId }
        ],
        status: 'active'
      });
      
      if (existingFriendship) {
        return res.status(409).json({ message: 'Users are already friends' });
      }
      
      // Create the friend request
      const friendRequest = new FriendRequest({
        senderId,
        receiverId,
        message: message || '',
        status: 'pending'
      });
      
      await friendRequest.save();
      
      // Clear any cached data for the receiver
      await redisUtils.deleteCachedFriendList(receiverId);
      await redisUtils.deleteCachedRecentFriendRequests(receiverId);
      
      res.status(201).json({ 
        message: 'Friend request sent successfully',
        request: friendRequest 
      });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Respond to a friend request (accept/reject/cancel)
const respondToFriendRequest = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      const { requestId, action } = req.body;
      
      // Validate input
      if (!requestId) {
        return res.status(400).json({ message: 'Request ID is required' });
      }
      
      if (!action || !['accept', 'reject', 'cancel'].includes(action)) {
        return res.status(400).json({ message: 'Action must be accept, reject, or cancel' });
      }
      
      // Get the friend request
      const friendRequest = await FriendRequest.findById(requestId);
      
      if (!friendRequest) {
        return res.status(404).json({ message: 'Friend request not found' });
      }
      
      // Check permissions based on action
      if (action === 'accept' || action === 'reject') {
        // Only receiver can accept/reject
        if (friendRequest.receiverId !== userId) {
          return res.status(403).json({ message: 'Only the receiver can accept or reject this request' });
        }
        
        if (friendRequest.status !== 'pending') {
          return res.status(400).json({ message: 'This request has already been processed' });
        }
      } else if (action === 'cancel') {
        // Only sender can cancel
        if (friendRequest.senderId !== userId) {
          return res.status(403).json({ message: 'Only the sender can cancel this request' });
        }
        
        if (friendRequest.status !== 'pending') {
          return res.status(400).json({ message: 'This request has already been processed and cannot be cancelled' });
        }
      }
      
      // Use a transaction to ensure data consistency
      const session = await mongoose.startSession();
      await session.withTransaction(async () => {
        // Update friend request status
        friendRequest.status = action;
        await friendRequest.save({ session });
        
        // If accepting, create the friendship
        if (action === 'accept') {
          const friendship = new Friendship({
            userId1: friendRequest.senderId,
            userId2: friendRequest.receiverId,
            status: 'active'
          });
          
          await friendship.save({ session });
        }
      });
      await session.endSession();
      
      // Clear cached data
      await redisUtils.deleteCachedFriendList(friendRequest.senderId);
      await redisUtils.deleteCachedFriendList(friendRequest.receiverId);
      await redisUtils.deleteCachedRecentFriendRequests(friendRequest.receiverId);
      await redisUtils.deleteCachedRecentFriendRequests(friendRequest.senderId);
      
      res.json({ 
        message: `Friend request ${action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'cancelled'} successfully`,
        request: friendRequest 
      });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Respond to friend request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get friend requests (incoming/outgoing)
const getFriendRequests = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      const { type = 'received' } = req.query;
      
      let query = {};
      
      if (type === 'received') {
        query = { receiverId: userId, status: 'pending' };
      } else if (type === 'sent') {
        query = { senderId: userId, status: 'pending' };
      } else {
        return res.status(400).json({ message: 'Type must be "sent" or "received"' });
      }
      
      // Try to get from cache first
      const cacheKey = `friend_requests:${userId}:${type}`;
      let friendRequests = await redisUtils.getCachedRecentFriendRequests(cacheKey);
      
      if (!friendRequests) {
        // Get from database
        friendRequests = await FriendRequest.find(query)
          .populate('senderId receiverId', 'username firstName lastName profilePicture')
          .sort({ createdAt: -1 })
          .lean();
        
        // Cache the results
        await redisUtils.cacheRecentFriendRequests(cacheKey, friendRequests);
      }
      
      res.json({ requests: friendRequests, type });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get pending friend requests count
const getPendingRequestsCount = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      
      // Try to get from cache first
      let count = await redisUtils.getCachedFriendRequestCount(userId);
      
      if (count === 0) { // If not in cache (0 could be valid) or expired
        // Get from database
        count = await FriendRequest.countDocuments({
          receiverId: userId,
          status: 'pending'
        });
        
        // Cache the count
        await redisUtils.cacheFriendRequestCount(userId, count);
      }
      
      res.json({ count });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get pending requests count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get friends list
const getFriendsList = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      const { page = 1, limit = 20 } = req.query;
      
      // Try to get from cache first
      const cacheKey = `friends_list:${userId}:${page}:${limit}`;
      let friends = await redisUtils.getCachedFriendList(cacheKey);
      
      if (!friends) {
        // Find friendships for this user
        const friendships = await Friendship.find({
          $or: [
            { userId1: userId, status: 'active' },
            { userId2: userId, status: 'active' }
          ]
        }).lean();
        
        // Extract the friend IDs (the user that's not the current user)
        const friendIds = friendships.map(friendship => 
          friendship.userId1 === userId ? friendship.userId2 : friendship.userId1
        );
        
        // Get friend profiles (in a real app, you'd call the user profile service)
        // For now, we'll return just the IDs and basic info
        friends = friendIds; // In a real implementation, you'd fetch user profiles
        
        // Cache the results
        await redisUtils.cacheFriendList(cacheKey, friends);
      }
      
      // Calculate pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedFriends = friends.slice(startIndex, endIndex);
      
      res.json({
        friends: paginatedFriends,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: friends.length,
          pages: Math.ceil(friends.length / limit)
        }
      });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Get friends list error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Unfriend someone
const unfriend = async (req, res) => {
  try {
    // Extract user ID from JWT token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_key';
      const decoded = jwt.verify(token, secret);
      const userId = decoded.userId;
      const { userId: targetUserId } = req.params;
      
      // Validate input
      if (!targetUserId) {
        return res.status(400).json({ message: 'Target user ID is required' });
      }
      
      // Check if they are actually friends
      const friendship = await Friendship.findOne({
        $or: [
          { userId1: userId, userId2: targetUserId },
          { userId1: targetUserId, userId2: userId }
        ],
        status: 'active'
      });
      
      if (!friendship) {
        return res.status(404).json({ message: 'No friendship found' });
      }
      
      // Update friendship status to removed
      friendship.status = 'removed';
      await friendship.save();
      
      // Clear cached data
      await redisUtils.deleteCachedFriendList(userId);
      await redisUtils.deleteCachedFriendList(targetUserId);
      
      res.json({ message: 'User unfriended successfully' });
    } catch (verifyError) {
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Unfriend error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  sendFriendRequest,
  respondToFriendRequest,
  getFriendRequests,
  getFriendsList,
  unfriend,
  getPendingRequestsCount
};