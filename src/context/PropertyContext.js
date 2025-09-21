import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CredentialsContext } from './CredentialsContext';
import {
  fetchProperties,
  createProperty as apiCreateProperty,
  updateProperty as apiUpdateProperty,
  deleteProperty as apiDeleteProperty,
} from '../services/NetworkUtils';

// Property context
export const PropertyContext = createContext();

// Storage key for properties
const PROPERTIES_STORAGE_KEY = '@RentalInn:properties';
const SELECTED_PROPERTY_STORAGE_KEY = '@RentalInn:selectedProperty';

// Default properties (can be removed once user adds their own)
const DEFAULT_PROPERTIES = [
  {
    id: 'all',
    name: 'All Properties',
    type: 'aggregate',
    address: '',
    city: '',
    state: '',
    pincode: '',
    totalRooms: 0,
    description: 'View analytics for all properties combined',
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
];

export const PropertyProvider = ({ children }) => {
  const { credentials } = useContext(CredentialsContext);
  const [properties, setProperties] = useState(DEFAULT_PROPERTIES);
  const [selectedProperty, setSelectedProperty] = useState(
    DEFAULT_PROPERTIES[0],
  );
  const [loading, setLoading] = useState(true);

  // Load properties from API and storage on app start
  useEffect(() => {
    const loadProperties = async () => {
      try {
        setLoading(true);

        // If user is authenticated, fetch from API
        if (credentials?.token || credentials?.accessToken) {
          const accessToken = credentials.token || credentials.accessToken;
          const apiResponse = await fetchProperties(accessToken);

          if (apiResponse.success && apiResponse.data) {
            // Extract properties from paginated response structure
            const propertiesData = apiResponse.data.items || apiResponse.data;

            // Ensure propertiesData is an array
            const propertiesArray = Array.isArray(propertiesData)
              ? propertiesData
              : [];

            // Combine API properties with "All Properties" option
            const allProperties = [DEFAULT_PROPERTIES[0], ...propertiesArray];
            setProperties(allProperties);

            console.log(
              `Successfully loaded ${propertiesArray.length} properties from API`,
            );

            // Load selected property from storage
            const storedSelectedProperty = await AsyncStorage.getItem(
              SELECTED_PROPERTY_STORAGE_KEY,
            );
            if (storedSelectedProperty) {
              const parsedSelected = JSON.parse(storedSelectedProperty);
              const foundProperty = allProperties.find(
                p => p.id === parsedSelected.id,
              );
              setSelectedProperty(foundProperty || DEFAULT_PROPERTIES[0]);
            } else {
              setSelectedProperty(DEFAULT_PROPERTIES[0]);
            }
          } else {
            console.error(
              'Failed to fetch properties from API:',
              apiResponse.error,
            );
            // Fallback to local storage if API fails
            await loadFromLocalStorage();
          }
        } else {
          // If not authenticated, load from local storage
          await loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading properties:', error);
        // Fallback to local storage on error
        await loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };

    const loadFromLocalStorage = async () => {
      try {
        // Load properties from local storage (fallback)
        const storedProperties = await AsyncStorage.getItem(
          PROPERTIES_STORAGE_KEY,
        );
        const parsedProperties = storedProperties
          ? JSON.parse(storedProperties)
          : [];

        // Always include the "All Properties" option
        const allProperties = [DEFAULT_PROPERTIES[0], ...parsedProperties];
        setProperties(allProperties);

        // Load selected property
        const storedSelectedProperty = await AsyncStorage.getItem(
          SELECTED_PROPERTY_STORAGE_KEY,
        );
        if (storedSelectedProperty) {
          const parsedSelected = JSON.parse(storedSelectedProperty);
          const foundProperty = allProperties.find(
            p => p.id === parsedSelected.id,
          );
          setSelectedProperty(foundProperty || DEFAULT_PROPERTIES[0]);
        } else {
          setSelectedProperty(DEFAULT_PROPERTIES[0]);
        }
      } catch (error) {
        console.error('Error loading from local storage:', error);
        setProperties(DEFAULT_PROPERTIES);
        setSelectedProperty(DEFAULT_PROPERTIES[0]);
      }
    };

    loadProperties();
  }, [credentials]);

  // Save properties to storage whenever properties change
  const saveProperties = useCallback(async newProperties => {
    try {
      // Filter out the default "All Properties" entry for storage
      const propertiesToStore = newProperties.filter(p => p.id !== 'all');
      await AsyncStorage.setItem(
        PROPERTIES_STORAGE_KEY,
        JSON.stringify(propertiesToStore),
      );
    } catch (error) {
      console.error('Error saving properties:', error);
    }
  }, []);

  // Save selected property to storage
  const saveSelectedProperty = useCallback(async property => {
    try {
      await AsyncStorage.setItem(
        SELECTED_PROPERTY_STORAGE_KEY,
        JSON.stringify(property),
      );
    } catch (error) {
      console.error('Error saving selected property:', error);
    }
  }, []);

  // Add new property
  const addProperty = useCallback(
    async propertyData => {
      try {
        const accessToken = credentials?.token || credentials?.accessToken;

        if (accessToken) {
          // Use API if authenticated
          const apiResponse = await apiCreateProperty(
            accessToken,
            propertyData,
          );

          if (apiResponse.success && apiResponse.data) {
            const newProperty = apiResponse.data;
            const updatedProperties = [...properties, newProperty];
            setProperties(updatedProperties);

            // Also save to local storage as backup
            await saveProperties(updatedProperties);

            return newProperty;
          } else {
            throw new Error(apiResponse.error || 'Failed to create property');
          }
        } else {
          // Fallback to local storage if not authenticated
          const newProperty = {
            id: `property_${Date.now()}`,
            ...propertyData,
            totalRooms: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const updatedProperties = [...properties, newProperty];
          setProperties(updatedProperties);
          await saveProperties(updatedProperties);

          return newProperty;
        }
      } catch (error) {
        console.error('Error adding property:', error);
        throw error;
      }
    },
    [properties, saveProperties, credentials],
  );

  // Update property
  const updateProperty = useCallback(
    async (propertyId, updates) => {
      try {
        const accessToken = credentials?.token || credentials?.accessToken;

        if (accessToken) {
          // Use API if authenticated
          const apiResponse = await apiUpdateProperty(
            accessToken,
            propertyId,
            updates,
          );

          if (apiResponse.success && apiResponse.data) {
            const updatedProperty = apiResponse.data;
            const updatedProperties = properties.map(property =>
              property.id === propertyId ? updatedProperty : property,
            );

            setProperties(updatedProperties);
            await saveProperties(updatedProperties);

            // Update selected property if it was the one being updated
            if (selectedProperty.id === propertyId) {
              setSelectedProperty(updatedProperty);
              await saveSelectedProperty(updatedProperty);
            }

            return updatedProperty;
          } else {
            throw new Error(apiResponse.error || 'Failed to update property');
          }
        } else {
          // Fallback to local storage if not authenticated
          const updatedProperties = properties.map(property =>
            property.id === propertyId
              ? { ...property, ...updates, updatedAt: new Date().toISOString() }
              : property,
          );

          setProperties(updatedProperties);
          await saveProperties(updatedProperties);

          // Update selected property if it was the one being updated
          if (selectedProperty.id === propertyId) {
            const updatedSelectedProperty = updatedProperties.find(
              p => p.id === propertyId,
            );
            setSelectedProperty(updatedSelectedProperty);
            await saveSelectedProperty(updatedSelectedProperty);
          }

          return updatedProperties.find(p => p.id === propertyId);
        }
      } catch (error) {
        console.error('Error updating property:', error);
        throw error;
      }
    },
    [
      properties,
      selectedProperty,
      saveProperties,
      saveSelectedProperty,
      credentials,
    ],
  );

  // Delete property
  const deleteProperty = useCallback(
    async propertyId => {
      try {
        // Cannot delete the "All Properties" default entry
        if (propertyId === 'all') {
          throw new Error('Cannot delete the "All Properties" entry');
        }

        const accessToken = credentials?.token || credentials?.accessToken;

        if (accessToken) {
          // Use API if authenticated
          const apiResponse = await apiDeleteProperty(accessToken, propertyId);

          if (apiResponse.success) {
            const updatedProperties = properties.filter(
              property => property.id !== propertyId,
            );
            setProperties(updatedProperties);
            await saveProperties(updatedProperties);

            // If the deleted property was selected, switch to "All Properties"
            if (selectedProperty.id === propertyId) {
              setSelectedProperty(DEFAULT_PROPERTIES[0]);
              await saveSelectedProperty(DEFAULT_PROPERTIES[0]);
            }

            return true;
          } else {
            throw new Error(apiResponse.error || 'Failed to delete property');
          }
        } else {
          // Fallback to local storage if not authenticated
          const updatedProperties = properties.filter(
            property => property.id !== propertyId,
          );
          setProperties(updatedProperties);
          await saveProperties(updatedProperties);

          // If the deleted property was selected, switch to "All Properties"
          if (selectedProperty.id === propertyId) {
            setSelectedProperty(DEFAULT_PROPERTIES[0]);
            await saveSelectedProperty(DEFAULT_PROPERTIES[0]);
          }

          return true;
        }
      } catch (error) {
        console.error('Error deleting property:', error);
        throw error;
      }
    },
    [
      properties,
      selectedProperty,
      saveProperties,
      saveSelectedProperty,
      credentials,
    ],
  );

  // Switch selected property
  const switchProperty = useCallback(
    async property => {
      try {
        setSelectedProperty(property);
        await saveSelectedProperty(property);
      } catch (error) {
        console.error('Error switching property:', error);
        throw error;
      }
    },
    [saveSelectedProperty],
  );

  // Get properties excluding "All Properties" (for management operations)
  const managedProperties = useMemo(() => {
    return properties.filter(p => p.id !== 'all');
  }, [properties]);

  // Get property by ID
  const getPropertyById = useCallback(
    propertyId => {
      return properties.find(property => property.id === propertyId);
    },
    [properties],
  );

  // Check if user has any properties (excluding "All Properties")
  const hasProperties = useMemo(() => {
    return managedProperties.length > 0;
  }, [managedProperties]);

  // Context value
  const contextValue = useMemo(
    () => ({
      // State
      properties,
      managedProperties,
      selectedProperty,
      loading,
      hasProperties,

      // Actions
      addProperty,
      updateProperty,
      deleteProperty,
      switchProperty,
      getPropertyById,

      // Helper functions
      isAllPropertiesSelected: selectedProperty?.id === 'all',
    }),
    [
      properties,
      managedProperties,
      selectedProperty,
      loading,
      hasProperties,
      addProperty,
      updateProperty,
      deleteProperty,
      switchProperty,
      getPropertyById,
    ],
  );

  return (
    <PropertyContext.Provider value={contextValue}>
      {children}
    </PropertyContext.Provider>
  );
};

// Custom hook for using property context
export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

export default PropertyContext;
