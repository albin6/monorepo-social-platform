// libs/validators/auth/auth.validators.js
const Joi = require('joi');

class AuthValidators {
  // Schema for user registration
  static registerSchema = Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.alphanum': 'Username must only contain alphanumeric characters',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'any.required': 'Username is required'
      }),
    
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        'any.required': 'Password is required'
      }),
    
    firstName: Joi.string()
      .max(50)
      .required()
      .messages({
        'string.max': 'First name cannot exceed 50 characters',
        'any.required': 'First name is required'
      }),
    
    lastName: Joi.string()
      .max(50)
      .required()
      .messages({
        'string.max': 'Last name cannot exceed 50 characters',
        'any.required': 'Last name is required'
      }),
    
    dateOfBirth: Joi.date()
      .max('100 years ago')
      .min('13 years ago')
      .optional()
      .messages({
        'date.max': 'Date of birth cannot be more than 100 years ago',
        'date.min': 'User must be at least 13 years old',
        'date.base': 'Date of birth must be a valid date'
      }),
    
    phoneNumber: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    
    bio: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Bio cannot exceed 500 characters'
      }),
    
    avatar: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Avatar must be a valid URL'
      })
  });

  // Schema for user login
  static loginSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    
    password: Joi.string()
      .min(1)
      .max(128)
      .required()
      .messages({
        'string.min': 'Password is required',
        'string.max': 'Password cannot exceed 128 characters',
        'any.required': 'Password is required'
      })
  });

  // Schema for password reset request
  static passwordResetRequestSchema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  });

  // Schema for password reset
  static passwordResetSchema = Joi.object({
    token: Joi.string()
      .length(64)
      .required()
      .messages({
        'string.length': 'Invalid reset token',
        'any.required': 'Reset token is required'
      }),
    
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
      .required()
      .messages({
        'string.min': 'Password must be at least 8 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        'any.required': 'New password is required'
      })
  });

  // Schema for password change
  static passwordChangeSchema = Joi.object({
    currentPassword: Joi.string()
      .min(1)
      .max(128)
      .required()
      .messages({
        'string.min': 'Current password is required',
        'string.max': 'Current password cannot exceed 128 characters',
        'any.required': 'Current password is required'
      }),
    
    newPassword: Joi.string()
      .min(8)
      .max(128)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
      .required()
      .messages({
        'string.min': 'New password must be at least 8 characters long',
        'string.max': 'New password cannot exceed 128 characters',
        'string.pattern.base': 'New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
        'any.required': 'New password is required'
      })
  });

  // Schema for user profile update
  static profileUpdateSchema = Joi.object({
    firstName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'First name cannot exceed 50 characters'
      }),
    
    lastName: Joi.string()
      .max(50)
      .optional()
      .messages({
        'string.max': 'Last name cannot exceed 50 characters'
      }),
    
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .optional()
      .messages({
        'string.email': 'Please provide a valid email address'
      }),
    
    dateOfBirth: Joi.date()
      .max('100 years ago')
      .min('13 years ago')
      .optional()
      .messages({
        'date.max': 'Date of birth cannot be more than 100 years ago',
        'date.min': 'User must be at least 13 years old',
        'date.base': 'Date of birth must be a valid date'
      }),
    
    phoneNumber: Joi.string()
      .pattern(/^[\+]?[1-9][\d]{0,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'Please provide a valid phone number'
      }),
    
    bio: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Bio cannot exceed 500 characters'
      }),
    
    avatar: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Avatar must be a valid URL'
      }),
    
    website: Joi.string()
      .uri()
      .optional()
      .messages({
        'string.uri': 'Website must be a valid URL'
      }),
    
    location: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Location cannot exceed 100 characters'
      })
  });

  // Schema for OTP verification
  static otpVerificationSchema = Joi.object({
    otp: Joi.string()
      .length(6)
      .required()
      .messages({
        'string.length': 'OTP must be 6 digits',
        'any.required': 'OTP is required'
      }),
    
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      })
  });

  // Validate data against a schema
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
}

module.exports = AuthValidators;