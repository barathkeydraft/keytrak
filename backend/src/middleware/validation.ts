import { Request, Response, NextFunction } from 'express';
import * as yup from 'yup';

// Registration validation schema
const registrationSchema = yup.object({
  body: yup.object({
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup
      .string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .required('Password is required'),
    name: yup.string().required('Name is required'),
  }),
});

// Login validation schema
const loginSchema = yup.object({
  body: yup.object({
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().required('Password is required'),
  }),
});

// Middleware for validating registration requests
export const validateRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await registrationSchema.validate({
      body: req.body,
    });
    return next();
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Validation error occurred' });
  }
};

// Middleware for validating login requests
export const validateLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await loginSchema.validate({
      body: req.body,
    });
    return next();
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Validation error occurred' });
  }
}; 