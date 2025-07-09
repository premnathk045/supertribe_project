export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  const minLength = 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  if (password.length < minLength) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    }
  }

  if (!hasUpperCase) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    }
  }

  if (!hasLowerCase) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    }
  }

  if (!hasNumbers) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    }
  }

  if (!hasSpecialChar) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character'
    }
  }

  return {
    isValid: true,
    message: 'Password is strong'
  }
}

export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export const validateFullName = (fullName) => {
  return fullName && fullName.trim().length >= 2
}

export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  
  // Basic format validation
  try {
    const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`)
    return !!parsedUrl.hostname
  } catch (e) {
    return false
  }
}