// libs/dto/dto.js

// Base API Response DTO
class APIResponseDTO {
  constructor(success, data = null, message = null, errors = null) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }

  static success(data = null, message = 'Success') {
    return new APIResponseDTO(true, data, message);
  }

  static error(message = 'Error occurred', errors = null) {
    return new APIResponseDTO(false, null, message, errors);
  }

  static notFound(message = 'Resource not found') {
    return new APIResponseDTO(false, null, message);
  }

  static unauthorized(message = 'Unauthorized') {
    return new APIResponseDTO(false, null, message);
  }

  static forbidden(message = 'Forbidden') {
    return new APIResponseDTO(false, null, message);
  }

  static badRequest(message = 'Bad request', errors = null) {
    return new APIResponseDTO(false, null, message, errors);
  }

  static serverError(message = 'Internal server error') {
    return new APIResponseDTO(false, null, message);
  }

  // Convert to plain object for JSON serialization
  toObject() {
    return {
      success: this.success,
      data: this.data,
      message: this.message,
      errors: this.errors,
      timestamp: this.timestamp
    };
  }
}

// Pagination DTO
class PaginationDTO {
  constructor(data = {}) {
    this.page = data.page || 1;
    this.limit = data.limit || 10;
    this.total = data.total || 0;
    this.totalPages = Math.ceil(this.total / this.limit);
    this.hasNext = this.page < this.totalPages;
    this.hasPrev = this.page > 1;
    this.next = this.hasNext ? this.page + 1 : null;
    this.prev = this.hasPrev ? this.page - 1 : null;
  }

  toObject() {
    return {
      page: this.page,
      limit: this.limit,
      total: this.total,
      totalPages: this.totalPages,
      hasNext: this.hasNext,
      hasPrev: this.hasPrev,
      next: this.next,
      prev: this.prev
    };
  }
}

// Paged Response DTO
class PagedResponseDTO extends APIResponseDTO {
  constructor(data, pagination, message = 'Success') {
    super(true, data, message);
    this.pagination = pagination;
  }

  toObject() {
    return {
      success: this.success,
      data: this.data,
      message: this.message,
      pagination: this.pagination.toObject(),
      timestamp: this.timestamp
    };
  }
}

// Error DTO for validation errors
class ValidationErrorDTO {
  constructor(errors) {
    this.errors = errors.map(error => ({
      field: error.field,
      message: error.message
    }));
    this.message = 'Validation failed';
    this.timestamp = new Date().toISOString();
  }

  toObject() {
    return {
      errors: this.errors,
      message: this.message,
      timestamp: this.timestamp
    };
  }
}

// File Upload DTO
class FileUploadDTO {
  constructor(file) {
    this.originalName = file.originalname;
    this.fileName = file.filename;
    this.path = file.path;
    this.mimetype = file.mimetype;
    this.size = file.size;
    this.url = file.location || null; // For cloud storage
    this.createdAt = new Date();
  }

  toObject() {
    return {
      originalName: this.originalName,
      fileName: this.fileName,
      path: this.path,
      mimetype: this.mimetype,
      size: this.size,
      url: this.url,
      createdAt: this.createdAt
    };
  }
}

// Search DTO
class SearchDTO {
  constructor(query, type = 'all', limit = 10, page = 1) {
    this.query = query;
    this.type = type;
    this.limit = limit;
    this.page = page;
    this.offset = (page - 1) * limit;
  }
}

// Notification DTO
class NotificationDTO {
  constructor(notification) {
    this.id = notification._id || notification.id;
    this.userId = notification.userId;
    this.type = notification.type;
    this.title = notification.title;
    this.message = notification.message;
    this.data = notification.data || {};
    this.isRead = notification.isRead || false;
    this.createdAt = notification.createdAt ? new Date(notification.createdAt) : new Date();
    this.updatedAt = notification.updatedAt ? new Date(notification.updatedAt) : new Date();
  }

  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      title: this.title,
      message: this.message,
      data: this.data,
      isRead: this.isRead,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static createMultiple(notifications) {
    return notifications.map(notification => new NotificationDTO(notification));
  }
}

// Message DTO
class MessageDTO {
  constructor(message) {
    this.id = message._id || message.id;
    this.conversationId = message.conversationId;
    this.senderId = message.senderId;
    this.content = message.content;
    this.type = message.type || 'text';
    this.status = message.status || 'sent';
    this.sentAt = message.sentAt ? new Date(message.sentAt) : new Date();
    this.readAt = message.readAt ? new Date(message.readAt) : null;
    this.deliveredAt = message.deliveredAt ? new Date(message.deliveredAt) : null;
    this.updatedAt = message.updatedAt ? new Date(message.updatedAt) : new Date();
    this.attachments = message.attachments || [];
  }

  toObject() {
    return {
      id: this.id,
      conversationId: this.conversationId,
      senderId: this.senderId,
      content: this.content,
      type: this.type,
      status: this.status,
      sentAt: this.sentAt,
      readAt: this.readAt,
      deliveredAt: this.deliveredAt,
      updatedAt: this.updatedAt,
      attachments: this.attachments
    };
  }

  static createMultiple(messages) {
    return messages.map(message => new MessageDTO(message));
  }
}

// Conversation DTO
class ConversationDTO {
  constructor(conversation) {
    this.id = conversation._id || conversation.id;
    this.type = conversation.type || 'private';
    this.name = conversation.name || null;
    this.participants = conversation.participants || [];
    this.isAdmin = conversation.isAdmin || [];
    this.avatar = conversation.avatar || null;
    this.isArchived = conversation.isArchived || false;
    this.isMuted = conversation.isMuted || false;
    this.lastMessage = conversation.lastMessage || null;
    this.unreadCount = conversation.unreadCount || 0;
    this.createdAt = conversation.createdAt ? new Date(conversation.createdAt) : new Date();
    this.updatedAt = conversation.updatedAt ? new Date(conversation.updatedAt) : new Date();
  }

  toObject() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      participants: this.participants,
      isAdmin: this.isAdmin,
      avatar: this.avatar,
      isArchived: this.isArchived,
      isMuted: this.isMuted,
      lastMessage: this.lastMessage,
      unreadCount: this.unreadCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static createMultiple(conversations) {
    return conversations.map(conversation => new ConversationDTO(conversation));
  }
}

// Friend Request DTO
class FriendRequestDTO {
  constructor(friendRequest) {
    this.id = friendRequest._id || friendRequest.id;
    this.senderId = friendRequest.senderId;
    this.receiverId = friendRequest.receiverId;
    this.status = friendRequest.status || 'pending';
    this.message = friendRequest.message || null;
    this.createdAt = friendRequest.createdAt ? new Date(friendRequest.createdAt) : new Date();
    this.updatedAt = friendRequest.updatedAt ? new Date(friendRequest.updatedAt) : new Date();
  }

  toObject() {
    return {
      id: this.id,
      senderId: this.senderId,
      receiverId: this.receiverId,
      status: this.status,
      message: this.message,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  static createMultiple(friendRequests) {
    return friendRequests.map(friendRequest => new FriendRequestDTO(friendRequest));
  }
}

// Activity DTO
class ActivityDTO {
  constructor(activity) {
    this.id = activity._id || activity.id;
    this.userId = activity.userId;
    this.type = activity.type;
    this.action = activity.action;
    this.targetId = activity.targetId;
    this.targetType = activity.targetType;
    this.metadata = activity.metadata || {};
    this.createdAt = activity.createdAt ? new Date(activity.createdAt) : new Date();
  }

  toObject() {
    return {
      id: this.id,
      userId: this.userId,
      type: this.type,
      action: this.action,
      targetId: this.targetId,
      targetType: this.targetType,
      metadata: this.metadata,
      createdAt: this.createdAt
    };
  }

  static createMultiple(activities) {
    return activities.map(activity => new ActivityDTO(activity));
  }
}

module.exports = {
  APIResponseDTO,
  PaginationDTO,
  PagedResponseDTO,
  ValidationErrorDTO,
  FileUploadDTO,
  SearchDTO,
  NotificationDTO,
  MessageDTO,
  ConversationDTO,
  FriendRequestDTO,
  ActivityDTO
};