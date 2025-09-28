// navigation/constants.js

// Screen names for consistent navigation
export const SCREEN_NAMES = {
  // Auth screens
  LOGIN: 'Login',
  SIGNUP: 'SignUp',
  FORGOT_PASSWORD: 'ForgotPassword',
  RESET_PASSWORD: 'ResetPassword',
  VERIFY_OTP: 'VerifyOTP',
  ONBOARDING: 'Onboarding',

  // Main navigation
  DRAWER_STACK: 'DrawerStack',
  BOTTOM_NAVIGATION: 'BottomNavigation',
  AUTH_STACK: 'AuthStack',

  // Bottom tab screens
  DASHBOARD: 'Dashboard',
  ROOMS: 'Rooms',
  TENANTS: 'Tenants',
  TICKETS: 'Tickets',

  // Detail screens
  ROOM_DETAILS: 'RoomDetails',
  TENANT_DETAILS: 'TenantDetails',
  TICKET_DETAILS: 'TicketDetails',
  SETTINGS: 'Settings',

  // Modal screens
  ADD_ROOM: 'AddRoom',
  EDIT_ROOM: 'EditRoom',
  ADD_PROPERTY: 'AddProperty',
  ADD_TENANT: 'AddTenant',
  EDIT_TENANT: 'EditTenant',
  ADD_TICKET: 'AddTicket',
  EDIT_TICKET: 'EditTicket',

  // Profile screens
  PROFILE: 'Profile',
  EDIT_PROFILE: 'EditProfile',

  // Additional screens
  ROOM_ANALYTICS: 'RoomAnalytics',
  TENANT_HISTORY: 'TenantHistory',
  MAINTENANCE_SCHEDULE: 'MaintenanceSchedule',
  REVENUE_OVERVIEW: 'RevenueOverview',
  EXPENSE_TRACKING: 'ExpenseTracking',
  PAYMENT_HISTORY: 'PaymentHistory',
  RECORD_PAYMENT: 'RecordPayment',
  NOTICES: 'Notices',
  PAYMENTS: 'Payments',
  KYC: 'KYC',
  SUPPORT: 'Support',
  FAQ: 'FAQ',
  CONTACT_SUPPORT: 'ContactSupport',
  APP_TUTORIAL: 'AppTutorial',

  // Utility screens
  IMAGE_VIEWER: 'ImageViewer',
  PDF_VIEWER: 'PDFViewer',
  NOTIFICATIONS: 'Notifications',
  SEARCH: 'Search',
};

// Route parameters type definitions
export const ROUTE_PARAMS = {
  [SCREEN_NAMES.ROOM_DETAILS]: {
    room_id: 'string',
    roomData: 'object',
  },
  [SCREEN_NAMES.TENANT_DETAILS]: {
    tenant_id: 'string',
    tenantData: 'object',
  },
  [SCREEN_NAMES.TICKET_DETAILS]: {
    ticket_id: 'string',
    ticketData: 'object',
  },
  [SCREEN_NAMES.ADD_ROOM]: {
    editMode: 'boolean',
    roomData: 'object',
  },
  [SCREEN_NAMES.EDIT_ROOM]: {
    room_id: 'string',
    roomData: 'object',
  },
  [SCREEN_NAMES.ADD_TENANT]: {
    editMode: 'boolean',
    tenantData: 'object',
    room_id: 'string',
  },
  [SCREEN_NAMES.EDIT_TENANT]: {
    tenant_id: 'string',
    tenantData: 'object',
  },
  [SCREEN_NAMES.IMAGE_VIEWER]: {
    images: 'array',
    initialIndex: 'number',
  },
  [SCREEN_NAMES.PDF_VIEWER]: {
    uri: 'string',
    title: 'string',
  },
};

// Storage keys for consistent data management
export const STORAGE_KEYS = {
  // Authentication
  USER_TOKEN: 'userToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  USER_CREDENTIALS: 'pgOwnerCredentials',
  DATA_VERSION: 'dataVersion',
  ACCESS_TOKEN: 'pgOwnerCredentials',

  // App preferences
  USER_PREFERENCES: 'userPreferences',
  THEME_MODE: 'themeMode',
  LANGUAGE: 'language',

  // Security
  BIOMETRIC_ENABLED: 'biometricEnabled',
  PIN_ENABLED: 'pinEnabled',

  // Features
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  PUSH_TOKEN: 'pushToken',

  // Analytics
  LAST_LOGIN: 'lastLogin',
  APP_VERSION: 'appVersion',
  DEVICE_ID: 'deviceId',

  // Cache
  ROOMS_CACHE: 'roomsCache',
  TENANTS_CACHE: 'tenantsCache',
  TICKETS_CACHE: 'ticketsCache',

  // Onboarding
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  TUTORIAL_COMPLETED: 'tutorialCompleted',
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  VALIDATE_TOKEN: '/auth/validate-token',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_OTP: '/auth/verify-otp',

  // User management
  USER_PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile/update',
  CHANGE_PASSWORD: '/user/change-password',
  DELETE_ACCOUNT: '/user/delete-account',

  // Rooms
  ROOMS: '/rooms',
  ROOM_DETAILS: '/rooms/:id',
  CREATE_ROOM: '/rooms/create',
  UPDATE_ROOM: '/rooms/:id/update',
  DELETE_ROOM: '/rooms/:id/delete',
  ROOM_ANALYTICS: '/rooms/analytics',

  // Tenants
  TENANTS: '/tenants',
  TENANT_DETAILS: '/tenants/:id',
  CREATE_TENANT: '/tenants/create',
  UPDATE_TENANT: '/tenants/:id/update',
  DELETE_TENANT: '/tenants/:id/delete',
  TENANT_HISTORY: '/tenants/history',

  // Tickets
  TICKETS: '/tickets',
  TICKET_DETAILS: '/tickets/:id',
  CREATE_TICKET: '/tickets/create',
  UPDATE_TICKET: '/tickets/:id/update',
  DELETE_TICKET: '/tickets/:id/delete',

  // File upload
  UPLOAD_IMAGE: '/upload/image',
  UPLOAD_DOCUMENT: '/upload/document',

  // Analytics
  DASHBOARD_STATS: '/analytics/dashboard',
  REVENUE_STATS: '/analytics/revenue',
  EXPENSE_STATS: '/analytics/expenses',

  // Notifications
  NOTIFICATIONS: '/notifications',
  MARK_READ: '/notifications/:id/read',
  NOTIFICATION_SETTINGS: '/notifications/settings',
};

// Menu items configuration for drawer
export const menuItems = [
  {
    label: 'Dashboard',
    icon: 'grid-outline',
    route: SCREEN_NAMES.DASHBOARD,
  },
  {
    label: 'Property Management',
    icon: 'business-outline',
    children: [
      {
        label: 'All Rooms',
        route: SCREEN_NAMES.ROOMS,
        badge: null,
      },
      {
        label: 'Add New Room',
        route: SCREEN_NAMES.ADD_ROOM,
        params: { editMode: false },
      },
      {
        label: 'Room Analytics',
        route: 'RoomAnalytics',
      },
    ],
  },
  {
    label: 'Payments',
    icon: 'cash-outline',
    route: SCREEN_NAMES.PAYMENTS,
  },
  {
    label: 'KYC Documents',
    icon: 'document-text-outline',
    route: SCREEN_NAMES.KYC,
  },
  {
    label: 'Notices',
    icon: 'alert-circle-outline',
    route: SCREEN_NAMES.NOTICES,
  },
  {
    label: 'Tenant Management',
    icon: 'people-outline',
    children: [
      {
        label: 'All Tenants',
        route: SCREEN_NAMES.TENANTS,
      },
      {
        label: 'Add New Tenant',
        route: SCREEN_NAMES.ADD_TENANT,
        params: { editMode: false },
      },
      {
        label: 'Tenant History',
        route: 'TenantHistory',
      },
    ],
  },
  {
    label: 'Support & Maintenance',
    icon: 'construct-outline',
    children: [
      {
        label: 'All Tickets',
        route: SCREEN_NAMES.TICKETS,
        badge: 2, // Dynamic badge for pending tickets
      },
      {
        label: 'Create Ticket',
        route: SCREEN_NAMES.ADD_TICKET,
      },
      {
        label: 'Maintenance Schedule',
        route: 'MaintenanceSchedule',
      },
    ],
  },
  {
    label: 'Financial Reports',
    icon: 'analytics-outline',
    children: [
      {
        label: 'Revenue Overview',
        route: 'RevenueOverview',
      },
      {
        label: 'Expense Tracking',
        route: 'ExpenseTracking',
      },
      {
        label: 'Payment History',
        route: 'PaymentHistory',
      },
    ],
  },
  {
    label: 'Settings',
    icon: 'settings-outline',
    route: SCREEN_NAMES.SETTINGS,
  },
  {
    label: 'Help & Support',
    icon: 'help-circle-outline',
    route: SCREEN_NAMES.SUPPORT,
    children: [
      {
        label: 'FAQ',
        route: SCREEN_NAMES.FAQ,
      },
      {
        label: 'Contact Support',
        route: SCREEN_NAMES.CONTACT_SUPPORT,
      },
      {
        label: 'App Tutorial',
        route: SCREEN_NAMES.APP_TUTORIAL,
      },
    ],
  },
];

// Animation configurations
export const ANIMATION_CONFIG = {
  SPLASH_DURATION: 2000,
  TRANSITION_DURATION: 300,
  SPRING_CONFIG: {
    tension: 50,
    friction: 7,
  },
  TIMING_CONFIG: {
    duration: 300,
    useNativeDriver: true,
  },
};

// Navigation options presets
export const NAVIGATION_OPTIONS = {
  DEFAULT: {
    headerShown: false,
    animation: 'slide_from_right',
    gestureEnabled: true,
  },
  MODAL: {
    presentation: 'modal',
    animation: 'slide_from_bottom',
    gestureEnabled: true,
    headerShown: true,
  },
  NO_GESTURE: {
    gestureEnabled: false,
    headerShown: false,
  },
  TRANSPARENT: {
    headerTransparent: true,
    headerShown: true,
  },
};

// App configuration
export const APP_CONFIG = {
  NAME: 'RentalInn',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  MIN_SUPPORTED_VERSION: '1.0.0',
  API_BASE_URL: __DEV__
    ? 'http://localhost:3000/api'
    : 'https://api.rentalinn.com',
  API_TIMEOUT: 15000,
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  OFFLINE_SUPPORT: true,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  PAGINATION_LIMIT: 20,
};

// Error messages
export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Please check your internet connection and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  SERVICE_UNAVAILABLE:
    'Service is temporarily unavailable. Please try again later.',

  // Authentication errors
  INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please login again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  ACCOUNT_LOCKED:
    'Your account has been temporarily locked. Please contact support.',

  // Validation errors
  VALIDATION_ERROR: 'Please fill in all required fields correctly.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  WEAK_PASSWORD:
    'Password must be at least 8 characters with uppercase, lowercase, and numbers.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  INVALID_PHONE: 'Please enter a valid phone number.',

  // Permission errors
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  FEATURE_DISABLED: 'This feature is currently disabled.',

  // File upload errors
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_FORMAT: 'Invalid file format. Please select a supported file.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',

  // General errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  MAINTENANCE_MODE: 'App is under maintenance. Please try again later.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
  SIGNUP_SUCCESS: 'Account created successfully. Please verify your email.',
  PASSWORD_RESET_SUCCESS: 'Password reset email sent successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',

  // Profile
  PROFILE_UPDATED: 'Profile updated successfully.',
  AVATAR_UPDATED: 'Profile picture updated successfully.',

  // Data operations
  DATA_SAVED: 'Data saved successfully.',
  DATA_DELETED: 'Data deleted successfully.',
  DATA_EXPORTED: 'Data exported successfully.',

  // Communication
  EMAIL_SENT: 'Email sent successfully.',
  MESSAGE_SENT: 'Message sent successfully.',
  FEEDBACK_SUBMITTED: 'Feedback submitted successfully.',

  // Rooms
  ROOM_CREATED: 'Room created successfully.',
  ROOM_UPDATED: 'Room updated successfully.',
  ROOM_DELETED: 'Room deleted successfully.',

  // Tenants
  TENANT_ADDED: 'Tenant added successfully.',
  TENANT_UPDATED: 'Tenant updated successfully.',
  TENANT_REMOVED: 'Tenant removed successfully.',

  // Tickets
  TICKET_CREATED: 'Ticket created successfully.',
  TICKET_UPDATED: 'Ticket updated successfully.',
  TICKET_RESOLVED: 'Ticket resolved successfully.',
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Theme constants
export const THEME_CONSTANTS = {
  HEADER_HEIGHT: 60,
  TAB_BAR_HEIGHT: 80,
  DRAWER_WIDTH: 280,
  BORDER_RADIUS: 12,
  SHADOW_ELEVATION: 5,
};

// Permission levels
export const PERMISSIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  ADMIN: 'admin',
  ROOM_READ: 'room_read',
  ROOM_CREATE: 'room_create',
  ROOM_UPDATE: 'room_update',
  ROOM_DELETE: 'room_delete',
  TENANT_READ: 'tenant_read',
  TENANT_CREATE: 'tenant_create',
  TENANT_UPDATE: 'tenant_update',
  TENANT_DELETE: 'tenant_delete',
  TICKET_READ: 'ticket_read',
  TICKET_CREATE: 'ticket_create',
  TICKET_UPDATE: 'ticket_update',
  TICKET_DELETE: 'ticket_delete',
  FINANCE_READ: 'finance_read',
  ANALYTICS_READ: 'analytics_read',
  MAINTENANCE_READ: 'maintenance_read',
};

export default {
  SCREEN_NAMES,
  ROUTE_PARAMS,
  STORAGE_KEYS,
  API_ENDPOINTS,
  menuItems,
  ANIMATION_CONFIG,
  NAVIGATION_OPTIONS,
  APP_CONFIG,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  NOTIFICATION_TYPES,
  THEME_CONSTANTS,
  PERMISSIONS,
};
