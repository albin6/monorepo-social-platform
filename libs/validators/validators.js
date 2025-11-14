// libs/validators/validators.js
const Joi = require('joi');
const AuthValidators = require('./auth/auth.validators');

class Validators {
  // Schema for pagination parameters
  static paginationSchema = Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .optional()
      .default(1)
      .messages({
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional()
      .default(10)
      .messages({
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      }),
    
    sort: Joi.string()
      .optional()
      .pattern(/^[a-zA-Z_-]+:(asc|desc)$/)
      .messages({
        'string.pattern.base': 'Sort must be in the format field:direction (e.g., createdAt:desc)'
      }),
    
    search: Joi.string()
      .optional()
      .max(100)
      .messages({
        'string.max': 'Search query cannot exceed 100 characters'
      })
  });

  // Schema for ID parameters
  static idParamSchema = Joi.object({
    id: Joi.string()
      .length(24)
      .hex()
      .required()
      .messages({
        'string.length': 'Invalid ID format',
        'string.hex': 'Invalid ID format',
        'any.required': 'ID is required'
      })
  });

  // Schema for UUID parameters
  static uuidParamSchema = Joi.object({
    uuid: Joi.string()
      .guid({
        version: ['uuidv4']
      })
      .required()
      .messages({
        'string.guid': 'Invalid UUID format',
        'any.required': 'UUID is required'
      })
  });

  // Schema for email parameters
  static emailParamSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  });

  // Schema for file upload
  static fileUploadSchema = Joi.object({
    originalname: Joi.string()
      .required()
      .messages({
        'any.required': 'File name is required'
      }),
    
    mimetype: Joi.string()
      .valid('image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 
             'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
             'audio/mpeg', 'audio/wav', 'audio/mp4',
             'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
             'text/plain')
      .required()
      .messages({
        'any.only': 'Unsupported file type',
        'any.required': 'File type is required'
      }),
    
    size: Joi.number()
      .max(10 * 1024 * 1024) // 10MB
      .required()
      .messages({
        'number.max': 'File size cannot exceed 10MB',
        'any.required': 'File size is required'
      })
  });

  // Schema for basic text content
  static textContentSchema = Joi.object({
    content: Joi.string()
      .min(1)
      .max(5000)
      .required()
      .messages({
        'string.min': 'Content cannot be empty',
        'string.max': 'Content cannot exceed 5000 characters',
        'any.required': 'Content is required'
      })
  });

  // Schema for search parameters
  static searchSchema = Joi.object({
    query: Joi.string()
      .min(1)
      .max(200)
      .required()
      .messages({
        'string.min': 'Search query cannot be empty',
        'string.max': 'Search query cannot exceed 200 characters',
        'any.required': 'Search query is required'
      }),
    
    type: Joi.string()
      .valid('user', 'post', 'group', 'all')
      .optional()
      .default('all')
      .messages({
        'any.only': 'Invalid search type'
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(50)
      .optional()
      .default(10)
      .messages({
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 50'
      })
  });

  // Schema for notification preferences
  static notificationPreferencesSchema = Joi.object({
    emailNotifications: Joi.boolean()
      .optional()
      .default(true),
    
    pushNotifications: Joi.boolean()
      .optional()
      .default(true),
    
    smsNotifications: Joi.boolean()
      .optional()
      .default(false),
    
    notificationTypes: Joi.array()
      .items(Joi.string().valid(
        'friend_request', 'message', 'comment', 'like', 
        'mention', 'system', 'marketing'
      ))
      .optional()
      .default(['friend_request', 'message', 'comment', 'like', 'mention', 'system'])
  });

  // Validate data using a provided schema
  static validate(schema, data) {
    const { error, value } = schema.validate(data, { abortEarly: false });
    
    if (error) {
      return {
        isValid: false,
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      };
    }
    
    return {
      isValid: true,
      data: value
    };
  }

  // Validate multiple schemas against the same data
  static validateMultiple(schemas, data) {
    const results = {};
    let allValid = true;

    for (const [name, schema] of Object.entries(schemas)) {
      const result = this.validate(schema, data);
      results[name] = result;
      
      if (!result.isValid) {
        allValid = false;
      }
    }

    return {
      allValid,
      results
    };
  }

  // Get a specific schema by name
  static getSchema(schemaName) {
    switch (schemaName) {
      case 'pagination':
        return this.paginationSchema;
      case 'idParam':
        return this.idParamSchema;
      case 'uuidParam':
        return this.uuidParamSchema;
      case 'emailParam':
        return this.emailParamSchema;
      case 'fileUpload':
        return this.fileUploadSchema;
      case 'textContent':
        return this.textContentSchema;
      case 'search':
        return this.searchSchema;
      case 'notificationPreferences':
        return this.notificationPreferencesSchema;
      case 'auth':
        return AuthValidators;
      default:
        throw new Error(`Unknown schema: ${schemaName}`);
    }
  }

  // Validate pagination parameters
  static validatePagination(data) {
    return this.validate(this.paginationSchema, data);
  }

  // Validate ID parameter
  static validateId(data) {
    return this.validate(this.idParamSchema, data);
  }

  // Validate UUID parameter
  static validateUUID(data) {
    return this.validate(this.uuidParamSchema, data);
  }

  // Validate email parameter
  static validateEmail(data) {
    return this.validate(this.emailParamSchema, data);
  }

  // Validate file upload
  static validateFileUpload(data) {
    return this.validate(this.fileUploadSchema, data);
  }

  // Validate text content
  static validateTextContent(data) {
    return this.validate(this.textContentSchema, data);
  }

  // Validate search parameters
  static validateSearch(data) {
    return this.validate(this.searchSchema, data);
  }

  // Validate notification preferences
  static validateNotificationPreferences(data) {
    return this.validate(this.notificationPreferencesSchema, data);
  }
}

module.exports = Validators;