package com.expense.tracker.security;

public class SecurityConstants {

    // JWT Secret Key - Must be at least 256 bits (32 characters) for HS256
    // In production, this should be stored in environment variables
    public static final String SECRET_KEY = "your-256-bit-secret-key-for-jwt-generation-must-be-very-long-and-secure";

    // Token expiration time: 24 hours in milliseconds
    public static final long EXPIRATION_TIME = 86400000;

    // Authorization header prefix
    public static final String TOKEN_PREFIX = "Bearer ";

    // Authorization header name
    public static final String HEADER_STRING = "Authorization";
}