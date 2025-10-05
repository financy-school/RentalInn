import axios from 'axios';
import { FINANCY_ENDPOINT_URL } from '../../config';
import helpers from '../navigation/helpers';
import { ERROR_MESSAGES } from '../navigation/constants';

const { ErrorHelper } = helpers;

// Debug log to ensure ErrorHelper is imported correctly
if (__DEV__) {
  console.log('NetworkUtils: ErrorHelper imported:', !!ErrorHelper);
}

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: FINANCY_ENDPOINT_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token and logging
apiClient.interceptors.request.use(
  config => {
    if (__DEV__) {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  error => {
    ErrorHelper.logError(error, 'API_REQUEST_ERROR');
    return Promise.reject(error);
  },
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  response => {
    if (__DEV__) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  error => {
    const errorMessage = getErrorMessage(error);

    // Enhanced error logging for debugging
    if (__DEV__) {
      console.error('API Error Details:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        isNetworkError: !error.response,
      });
    }

    ErrorHelper.logError(
      error,
      `API_RESPONSE_ERROR: ${error.config?.method} ${error.config?.url}`,
    );

    // Transform axios error to our standard format
    const transformedError = {
      ...error,
      message: errorMessage,
      isNetworkError: !error.response,
      statusCode: error.response?.status,
      data: error.response?.data,
    };

    return Promise.reject(transformedError);
  },
);

// Helper function to get user-friendly error messages
const getErrorMessage = error => {
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  const { status, data } = error.response;

  switch (status) {
    case 400:
      // Handle array of error messages
      if (data?.message && Array.isArray(data.message)) {
        return data.message.join('. ');
      }
      return data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.PERMISSION_DENIED;
    case 404:
      return 'Requested resource not found.';
    case 409:
      if (data?.message && Array.isArray(data.message)) {
        return data.message.join('. ');
      }
      return data?.message || 'Resource already exists.';
    case 422:
      if (data?.message && Array.isArray(data.message)) {
        return data.message.join('. ');
      }
      return data?.message || ERROR_MESSAGES.VALIDATION_ERROR;
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return ERROR_MESSAGES.SERVER_ERROR;
    case 503:
      return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
    default:
      return data?.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

// Helper function to create authorization headers
const getAuthHeaders = accessToken => {
  if (__DEV__) {
    console.log(
      'Auth token provided:',
      !!accessToken,
      accessToken ? 'Token present' : 'No token',
    );
  }

  if (!accessToken) {
    console.warn('No access token provided for API request');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
};

// Helper function to build query parameters
const buildQueryParams = (params = {}) => {
  const validParams = Object.entries(params)
    .filter(
      ([key, value]) => value !== undefined && value !== null && value !== '',
    )
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  if (Object.keys(validParams).length === 0) {
    return '';
  }

  const searchParams = new URLSearchParams(validParams);
  return `?${searchParams.toString()}`;
};

// Helper function to handle API responses consistently
const handleApiResponse = async (apiCall, operation = 'API_OPERATION') => {
  try {
    const response = await apiCall();
    return {
      success: true,
      data: response.data,
      status: response.status,
      error: null,
    };
  } catch (error) {
    ErrorHelper.logError(error, operation);
    return {
      success: false,
      data: null,
      status: error.statusCode || 500,
      error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      isNetworkError: error.isNetworkError || false,
    };
  }
};

/**
 * Authentication API calls
 */
export const handleUserSignup = async credentials => {
  return handleApiResponse(
    () => apiClient.post('/auth/register', credentials),
    'USER_SIGNUP',
  );
};

export const handleUserLogin = async credentials => {
  return handleApiResponse(
    () => apiClient.post('/auth/login', credentials),
    'USER_LOGIN',
  );
};

export const getOwnerDetails = async credentials => {
  if (__DEV__) {
    console.log('getOwnerDetails called with credentials:', {
      id: credentials?.user_id,
      hasToken: !!credentials?.token,
      hasAccessToken: !!credentials?.accessToken,
      keys: Object.keys(credentials || {}),
    });
  }

  return handleApiResponse(
    () =>
      apiClient.get(`/users/${credentials.user_id}`, {
        headers: getAuthHeaders(credentials.token || credentials.accessToken),
      }),
    'GET_OWNER_DETAILS',
  );
};

export const updateUserFirebaseToken = async (
  accessToken,
  userId,
  firebaseToken,
) => {
  if (__DEV__) {
    console.log('updateUserFirebaseToken called:', {
      userId,
      hasToken: !!accessToken,
      hasFirebaseToken: !!firebaseToken,
    });
  }

  return handleApiResponse(
    () =>
      apiClient.patch(
        `/users/${userId}`,
        { firebaseToken },
        {
          headers: getAuthHeaders(accessToken),
        },
      ),
    'UPDATE_FIREBASE_TOKEN',
  );
};

/**
 * Analytics API calls
 */

// Enhanced dashboard analytics with proper query parameters
export const getDashboardAnalytics = async (accessToken, queryParams = {}) => {
  if (__DEV__) {
    console.log('getDashboardAnalytics called with params:', {
      hasToken: !!accessToken,
      queryParams,
    });
  }

  const queryString = buildQueryParams(queryParams);
  const endpoint = `/analytics/dashboard${queryString}`;

  return handleApiResponse(
    () =>
      apiClient.get(endpoint, {
        headers: getAuthHeaders(accessToken),
      }),
    'GET_DASHBOARD_ANALYTICS',
  );
};

// Occupancy analytics
export const getOccupancyAnalytics = async (accessToken, queryParams = {}) => {
  if (__DEV__) {
    console.log('getOccupancyAnalytics called with params:', {
      hasToken: !!accessToken,
      queryParams,
    });
  }

  const queryString = buildQueryParams(queryParams);
  const endpoint = `/analytics/occupancy${queryString}`;

  return handleApiResponse(
    () =>
      apiClient.get(endpoint, {
        headers: getAuthHeaders(accessToken),
      }),
    'GET_OCCUPANCY_ANALYTICS',
  );
};

// Revenue trends analytics
export const getRevenueTrends = async (accessToken, queryParams = {}) => {
  if (__DEV__) {
    console.log('getRevenueTrends called with params:', {
      hasToken: !!accessToken,
      queryParams,
    });
  }

  const queryString = buildQueryParams(queryParams);
  const endpoint = `/analytics/revenue-trends${queryString}`;

  return handleApiResponse(
    () =>
      apiClient.get(endpoint, {
        headers: getAuthHeaders(accessToken),
      }),
    'GET_REVENUE_TRENDS',
  );
};

// Profit & Loss analytics
export const getProfitLossAnalytics = async (accessToken, queryParams = {}) => {
  if (__DEV__) {
    console.log('getProfitLossAnalytics called with params:', {
      hasToken: !!accessToken,
      queryParams,
    });
  }

  const queryString = buildQueryParams(queryParams);
  const endpoint = `/analytics/profit-loss${queryString}`;

  return handleApiResponse(
    () =>
      apiClient.get(endpoint, {
        headers: getAuthHeaders(accessToken),
      }),
    'GET_PROFIT_LOSS_ANALYTICS',
  );
};

/**
 *
 * Property Management API calls
 */

export const fetchProperties = async accessToken => {
  return handleApiResponse(
    () =>
      apiClient.get('/properties', {
        headers: getAuthHeaders(accessToken),
      }),
    'FETCH_PROPERTIES',
  );
};

export const getProperty = async (accessToken, property_id) => {
  return handleApiResponse(
    () =>
      apiClient.get(`/properties/${property_id}`, {
        headers: getAuthHeaders(accessToken),
      }),
    'GET_PROPERTY',
  );
};

export const createProperty = async (accessToken, propertyData) => {
  return handleApiResponse(
    () =>
      apiClient.post('/properties', propertyData, {
        headers: getAuthHeaders(accessToken),
      }),
    'CREATE_PROPERTY',
  );
};

export const updateProperty = async (
  accessToken,
  property_id,
  propertyData,
) => {
  return handleApiResponse(
    () =>
      apiClient.put(`/properties/${property_id}`, propertyData, {
        headers: getAuthHeaders(accessToken),
      }),
    'UPDATE_PROPERTY',
  );
};

export const deleteProperty = async (accessToken, property_id) => {
  return handleApiResponse(
    () =>
      apiClient.delete(`/properties/${property_id}`, {
        headers: getAuthHeaders(accessToken),
      }),
    'DELETE_PROPERTY',
  );
};

/**
 * Room Management API calls
 */
export const propertyRooms = async (accessToken, property_id) => {
  return handleApiResponse(
    () =>
      apiClient.get(`/properties/${property_id}/rooms`, {
        headers: {
          ...getAuthHeaders(accessToken),
          'x-property-id': property_id,
        },
      }),
    'GET_PROPERTY_ROOMS',
  );
};

export const getRoom = async (accessToken, property_id, room_id) => {
  return handleApiResponse(
    () =>
      apiClient.get(`/properties/${property_id}/rooms/${room_id}`, {
        headers: getAuthHeaders(accessToken),
      }),
    'GET_ROOM',
  );
};

export const createRoom = async (accessToken, property_id, roomData) => {
  return handleApiResponse(
    () =>
      apiClient.post(`/properties/${property_id}/rooms`, roomData, {
        headers: getAuthHeaders(accessToken),
      }),
    'CREATE_ROOM',
  );
};

export const updateRoom = async (
  accessToken,
  property_id,
  room_id,
  roomData,
) => {
  return handleApiResponse(
    () =>
      apiClient.patch(`/properties/${property_id}/rooms/${room_id}`, roomData, {
        headers: getAuthHeaders(accessToken),
      }),
    'UPDATE_ROOM',
  );
};

export const deleteRoom = async (accessToken, property_id, room_id) => {
  return handleApiResponse(
    () =>
      apiClient.delete(`/properties/${property_id}/rooms/${room_id}`, {
        headers: getAuthHeaders(accessToken),
      }),
    'DELETE_ROOM',
  );
};

/**
 * Tenant Management API calls
 */
export const addTenant = async (accessToken, property_id, tenantData) => {
  return handleApiResponse(
    () =>
      apiClient.post(
        '/tenants',
        {
          ...tenantData,
          property_id: property_id,
        },
        {
          headers: getAuthHeaders(accessToken),
        },
      ),
    'ADD_TENANT',
  );
};

export const updateTenant = async (accessToken, tenantId, tenantData) => {
  return handleApiResponse(
    () =>
      apiClient.patch(`/tenants/${tenantId}`, tenantData, {
        headers: getAuthHeaders(accessToken),
      }),
    'UPDATE_TENANT',
  );
};

export const fetchTenants = async (accessToken, property_id) => {
  return handleApiResponse(
    () =>
      apiClient.get('/tenants', {
        headers: getAuthHeaders(accessToken),
        params: {
          property_id: property_id,
        },
      }),
    'FETCH_TENANTS',
  );
};

export const getTenants = async (accessToken, property_id, room_id) => {
  return handleApiResponse(
    () =>
      apiClient.get(`/tenants/property/${property_id}/room/${room_id}`, {
        headers: {
          ...getAuthHeaders(accessToken),
          'x-property-id': property_id,
        },
      }),
    'GET_TENANTS_BY_ROOM',
  );
};

export const getTenant = async (accessToken, tenantId) => {
  return handleApiResponse(
    () =>
      apiClient.get(`/tenants/${tenantId}`, {
        headers: getAuthHeaders(accessToken),
      }),
    'GET_TENANT',
  );
};

export const putTenantOnNotice = async (accessToken, tenantId, noticeData) => {
  return handleApiResponse(
    () =>
      apiClient.patch(`/tenants/${tenantId}/notice`, noticeData, {
        headers: getAuthHeaders(accessToken),
      }),
    'PUT_TENANT_ON_NOTICE',
  );
};

export const deleteTenant = async (accessToken, tenantId) => {
  return handleApiResponse(
    () =>
      apiClient.delete(`/tenants/${tenantId}`, {
        headers: getAuthHeaders(accessToken),
      }),
    'DELETE_TENANT',
  );
};

/**
 * Document Management API calls
 */

export const updateDocument = (
  accessToken,
  property_id,
  documentId,
  documentData,
) => {
  return handleApiResponse(
    () =>
      apiClient.put(`/documents/${documentId}`, documentData, {
        headers: {
          ...getAuthHeaders(accessToken),
          'Content-Type': 'application/json',
          'x-property-id': property_id,
        },
      }),
    'UPDATE_DOCUMENT',
  );
};

export const deleteDocument = (accessToken, property_id, documentId) => {
  return handleApiResponse(
    () =>
      apiClient.delete(`/documents/${documentId}`, {
        headers: {
          ...getAuthHeaders(accessToken),
          'x-property-id': property_id,
        },
      }),
    'DELETE_DOCUMENT',
  );
};

export const createDocument = async (
  accessToken,
  property_id,
  documentData,
) => {
  return handleApiResponse(
    () =>
      apiClient.post('/documents', documentData, {
        headers: {
          ...getAuthHeaders(accessToken),
          'Content-Type': 'application/json',
          'x-property-id': property_id,
        },
      }),
    'UPLOAD_DOCUMENT',
  );
};

export const uploadToS3 = async (upload_url, file) => {
  // Fetch the file as a blob
  const response = await fetch(file.uri);
  const blob = await response.blob();

  // Upload to S3 using fetch
  const uploadResponse = await fetch(upload_url, {
    method: 'PUT',
    body: blob,
    headers: {
      'Content-Type': file.type || 'image/jpeg',
    },
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload image to S3');
  }

  return uploadResponse;
};

export const getDocument = async (accessToken, property_id, documentId) => {
  return handleApiResponse(
    () =>
      apiClient.get(`/documents/${documentId}`, {
        headers: {
          ...getAuthHeaders(accessToken),
          'x-property-id': property_id,
        },
      }),
    'GET_DOCUMENT',
  );
};

/**
 * Ticket Management API calls
 */
export const createTicket = async (accessToken, ticketData) => {
  return handleApiResponse(
    () =>
      apiClient.post('/tickets', ticketData, {
        headers: getAuthHeaders(accessToken),
      }),
    'CREATE_TICKET',
  );
};

export const fetchTickets = async (accessToken, property_id) => {
  return handleApiResponse(
    () =>
      apiClient.get('/tickets', {
        headers: getAuthHeaders(accessToken),
        params: {
          property_id: property_id,
        },
      }),
    'FETCH_TICKETS',
  );
};

export const updateTicketStatus = async (accessToken, ticketId, status) => {
  return handleApiResponse(
    () =>
      apiClient.patch(
        `/tickets/${ticketId}/status`,
        { status },
        {
          headers: getAuthHeaders(accessToken),
        },
      ),
    'UPDATE_TICKET_STATUS',
  );
};

export const deleteTicket = async (accessToken, ticketId) => {
  return handleApiResponse(
    () =>
      apiClient.delete(`/tickets/${ticketId}`, {
        headers: getAuthHeaders(accessToken),
      }),
    'DELETE_TICKET',
  );
};

export const updateTicket = async (accessToken, ticketId, ticketData) => {
  return handleApiResponse(
    () =>
      apiClient.patch(`/tickets/${ticketId}`, ticketData, {
        headers: getAuthHeaders(accessToken),
      }),
    'UPDATE_TICKET',
  );
};

/**
 * Invoice Management API calls
 */
export const getTenantInvoiceData = async (accessToken, tenantId) => {
  return handleApiResponse(
    () =>
      apiClient.get(`/invoices/tenants/${tenantId}/invoice-data`, {
        headers: getAuthHeaders(accessToken),
      }),
    'GET_TENANT_INVOICE_DATA',
  );
};

export const createInvoice = async (accessToken, invoiceData) => {
  return handleApiResponse(
    () =>
      apiClient.post('/invoices', invoiceData, {
        headers: getAuthHeaders(accessToken),
      }),
    'CREATE_INVOICE',
  );
};

export const recordPayment = async (accessToken, paymentData) => {
  return handleApiResponse(
    () =>
      apiClient.post('/invoices/payments', paymentData, {
        headers: getAuthHeaders(accessToken),
      }),
    'RECORD_PAYMENT',
  );
};

/**
 * Settings Management API calls
 */
export const getSettings = async accessToken => {
  return handleApiResponse(
    () =>
      apiClient.get('/settings', {
        headers: getAuthHeaders(accessToken),
      }),
    'GET_SETTINGS',
  );
};

export const getAppInfo = async accessToken => {
  return handleApiResponse(
    () =>
      apiClient.get('/settings/app-info', {
        headers: getAuthHeaders(accessToken),
      }),
    'GET_APP_INFO',
  );
};

export const updateSettings = async (accessToken, settingsData) => {
  return handleApiResponse(
    () =>
      apiClient.patch('/settings', settingsData, {
        headers: getAuthHeaders(accessToken),
      }),
    'UPDATE_SETTINGS',
  );
};

export const updateNotificationSettings = async (
  accessToken,
  notificationData,
) => {
  return handleApiResponse(
    () =>
      apiClient.patch('/settings/notifications', notificationData, {
        headers: getAuthHeaders(accessToken),
      }),
    'UPDATE_NOTIFICATION_SETTINGS',
  );
};

export const updatePreferences = async (accessToken, preferencesData) => {
  return handleApiResponse(
    () =>
      apiClient.patch('/settings/preferences', preferencesData, {
        headers: getAuthHeaders(accessToken),
      }),
    'UPDATE_PREFERENCES',
  );
};

export const updatePrivacySettings = async (accessToken, privacyData) => {
  return handleApiResponse(
    () =>
      apiClient.patch('/settings/privacy', privacyData, {
        headers: getAuthHeaders(accessToken),
      }),
    'UPDATE_PRIVACY_SETTINGS',
  );
};

export const resetSettings = async accessToken => {
  return handleApiResponse(
    () =>
      apiClient.post(
        '/settings/reset',
        {},
        {
          headers: getAuthHeaders(accessToken),
        },
      ),
    'RESET_SETTINGS',
  );
};

export const backupData = async accessToken => {
  return handleApiResponse(
    () =>
      apiClient.post(
        '/settings/backup',
        {},
        {
          headers: getAuthHeaders(accessToken),
        },
      ),
    'BACKUP_DATA',
  );
};

export const exportReports = async accessToken => {
  return handleApiResponse(
    () =>
      apiClient.post(
        '/settings/export-reports',
        {},
        {
          headers: getAuthHeaders(accessToken),
        },
      ),
    'EXPORT_REPORTS',
  );
};

export const clearCache = async accessToken => {
  return handleApiResponse(
    () =>
      apiClient.post(
        '/settings/clear-cache',
        {},
        {
          headers: getAuthHeaders(accessToken),
        },
      ),
    'CLEAR_CACHE',
  );
};

export const notifyPasswordChanged = async accessToken => {
  return handleApiResponse(
    () =>
      apiClient.post(
        '/settings/password-changed',
        {},
        {
          headers: getAuthHeaders(accessToken),
        },
      ),
    'PASSWORD_CHANGED',
  );
};

/**
 * Payments API calls
 */
export const getPayments = async (accessToken, params = {}) => {
  const { property_id, page = 1, limit = 50 } = params;
  const queryParams = {
    page,
    limit,
  };

  if (property_id && property_id !== 'all') {
    queryParams.property_id = property_id;
  }

  return handleApiResponse(
    () =>
      apiClient.get('/rentals/payments', {
        headers: getAuthHeaders(accessToken),
        params: queryParams,
      }),
    'GET_PAYMENTS',
  );
};

/**
 * KYC Management API calls
 */
export const fetchKYCData = async (accessToken, property_id) => {
  return handleApiResponse(
    () =>
      apiClient.get('/kyc', {
        headers: getAuthHeaders(accessToken),
        params: property_id ? { property_id } : {},
      }),
    'FETCH_KYC_DATA',
  );
};

export const updateKYC = async (accessToken, kycId, updateData) => {
  return handleApiResponse(
    () =>
      apiClient.patch(`/kyc/${kycId}`, updateData, {
        headers: getAuthHeaders(accessToken),
      }),
    'UPDATE_KYC',
  );
};

export const getKYCByTenantId = async (accessToken, tenantId) => {
  return handleApiResponse(
    () =>
      apiClient.get(`/kyc/tenant/${tenantId}`, {
        headers: getAuthHeaders(accessToken),
      }),
    'GET_KYC_BY_TENANT_ID',
  );
};
