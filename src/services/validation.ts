// src/services/validation.ts
export class ValidationService {
    static validateEmail(email: string): { isValid: boolean; error?: string } {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!email) {
        return { isValid: false, error: 'Email is required' };
      }
      
      if (!emailRegex.test(email)) {
        return { isValid: false, error: 'Please enter a valid email address' };
      }
      
      return { isValid: true };
    }
  
    static validatePassword(password: string): { isValid: boolean; error?: string } {
      if (!password) {
        return { isValid: false, error: 'Password is required' };
      }
      
      if (password.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters long' };
      }
      
      if (!/(?=.*[a-z])/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one lowercase letter' };
      }
      
      if (!/(?=.*[A-Z])/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one uppercase letter' };
      }
      
      if (!/(?=.*\d)/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one number' };
      }
      
      return { isValid: true };
    }
  
    static validateUsername(username: string): { isValid: boolean; error?: string } {
      if (!username) {
        return { isValid: false, error: 'Username is required' };
      }
      
      if (username.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters long' };
      }
      
      if (username.length > 25) {
        return { isValid: false, error: 'Username must be less than 25 characters' };
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, and underscores' };
      }
      
      return { isValid: true };
    }
  
    static validateAge(dateOfBirth: string): { isValid: boolean; error?: string; age?: number } {
      if (!dateOfBirth) {
        return { isValid: false, error: 'Date of birth is required' };
      }
      
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? age - 1 
        : age;
      
      if (actualAge < 21) {
        return { isValid: false, error: 'You must be at least 21 years old to use this app', age: actualAge };
      }
      
      if (actualAge > 120) {
        return { isValid: false, error: 'Please enter a valid date of birth', age: actualAge };
      }
      
      return { isValid: true, age: actualAge };
    }
  
    static validateRating(rating: number, min: number = 0, max: number = 10): { isValid: boolean; error?: string } {
      if (rating < min || rating > max) {
        return { isValid: false, error: `Rating must be between ${min} and ${max}` };
      }
      
      return { isValid: true };
    }
  
    static validateRequired(value: any, fieldName: string): { isValid: boolean; error?: string } {
      if (value === null || value === undefined || value === '') {
        return { isValid: false, error: `${fieldName} is required` };
      }
      
      return { isValid: true };
    }
  }