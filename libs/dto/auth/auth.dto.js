// libs/dto/auth/auth.dto.js

// User DTO for authentication-related data
class UserDTO {
  constructor(user) {
    this.id = user._id || user.id;
    this.username = user.username;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.fullName = `${user.firstName} ${user.lastName}`;
    this.avatar = user.avatar || null;
    this.bio = user.bio || null;
    this.dateOfBirth = user.dateOfBirth ? new Date(user.dateOfBirth) : null;
    this.phoneNumber = user.phoneNumber || null;
    this.website = user.website || null;
    this.location = user.location || null;
    this.createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
    this.updatedAt = user.updatedAt ? new Date(user.updatedAt) : new Date();
    this.isVerified = user.isVerified || false;
    this.isActive = user.isActive !== undefined ? user.isActive : true;
  }

  // Convert to plain object for serialization
  toObject() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      avatar: this.avatar,
      bio: this.bio,
      dateOfBirth: this.dateOfBirth,
      phoneNumber: this.phoneNumber,
      website: this.website,
      location: this.location,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isVerified: this.isVerified,
      isActive: this.isActive
    };
  }

  // Static method to create multiple user DTOs
  static createMultiple(users) {
    return users.map(user => new UserDTO(user));
  }
}

// Registration DTO
class RegistrationDTO {
  constructor(data) {
    this.username = data.username;
    this.email = data.email;
    this.password = data.password; // This should be hashed before saving
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    this.phoneNumber = data.phoneNumber || null;
    this.bio = data.bio || null;
    this.avatar = data.avatar || null;
    this.createdAt = new Date();
  }
}

// Login DTO
class LoginDTO {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.deviceInfo = data.deviceInfo || null;
    this.ipAddress = data.ipAddress || null;
  }
}

// Login Response DTO
class LoginResponseDTO {
  constructor(user, token, refreshToken) {
    this.user = new UserDTO(user);
    this.token = token;
    this.refreshToken = refreshToken;
    this.expiresIn = 3600; // 1 hour
  }

  toObject() {
    return {
      user: this.user.toObject(),
      token: this.token,
      refreshToken: this.refreshToken,
      expiresIn: this.expiresIn
    };
  }
}

// Token Refresh DTO
class TokenRefreshDTO {
  constructor(refreshToken) {
    this.refreshToken = refreshToken;
  }
}

// Password Reset Request DTO
class PasswordResetRequestDTO {
  constructor(email) {
    this.email = email;
  }
}

// Password Reset DTO
class PasswordResetDTO {
  constructor(token, newPassword) {
    this.token = token;
    this.newPassword = newPassword; // This should be hashed before saving
  }
}

// Password Change DTO
class PasswordChangeDTO {
  constructor(currentPassword, newPassword) {
    this.currentPassword = currentPassword;
    this.newPassword = newPassword; // This should be hashed before saving
  }
}

// Profile Update DTO
class ProfileUpdateDTO {
  constructor(data) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;
    this.phoneNumber = data.phoneNumber;
    this.bio = data.bio;
    this.avatar = data.avatar;
    this.website = data.website;
    this.location = data.location;
    this.updatedAt = new Date();
  }
}

// OTP Verification DTO
class OTPVerificationDTO {
  constructor(otp, email) {
    this.otp = otp;
    this.email = email;
  }
}

module.exports = {
  UserDTO,
  RegistrationDTO,
  LoginDTO,
  LoginResponseDTO,
  TokenRefreshDTO,
  PasswordResetRequestDTO,
  PasswordResetDTO,
  PasswordChangeDTO,
  ProfileUpdateDTO,
  OTPVerificationDTO
};