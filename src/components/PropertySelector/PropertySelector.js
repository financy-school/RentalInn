import React, { useContext, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { Card } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import StandardText from '../StandardText/StandardText';
import colors from '../../theme/colors';
import {
  PRIMARY,
  SECONDARY,
  BACKGROUND,
  SUCCESS,
  WARNING,
  BORDER_STANDARD,
} from '../../theme/colors';
import { RADIUS, PADDING, SPACING, SHADOW } from '../../theme/layout';
import { ThemeContext } from '../../context/ThemeContext';
import { useProperty } from '../../context/PropertyContext';
import { SCREEN_NAMES } from '../../navigation/constants';

const PropertySelector = ({
  navigation,
  showAddButton = true,
  showTitle = true,
  requireSpecificProperty = false, // New prop for action screens
  actionContext = null, // Context like 'add-room', 'add-tenant', etc.
}) => {
  const { theme: mode } = useContext(ThemeContext);
  const {
    properties,
    selectedProperty,
    switchProperty,
    isAllPropertiesSelected,
  } = useProperty();

  const [isExpanded, setIsExpanded] = useState(false);
  const [animatedHeight] = useState(new Animated.Value(0));

  // Filter properties based on context
  const availableProperties = requireSpecificProperty
    ? properties.filter(property => property.property_id !== 'all')
    : properties;

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Check if we need to show a warning for "All Properties" selection
  const showAllPropertiesWarning =
    requireSpecificProperty && isAllPropertiesSelected;

  // Don't auto-switch properties - let user manually switch when needed
  // This preserves the ability to use "All Properties" on the Home screen

  // Handle property selection
  const handlePropertySelect = async property => {
    try {
      await switchProperty(property);
      toggleDropdown();
    } catch (error) {
      console.error('Property switch error:', error);
    }
  };

  // Handle add property
  const handleAddProperty = () => {
    toggleDropdown();
    if (navigation) {
      navigation.navigate(SCREEN_NAMES.ADD_PROPERTY);
    }
  };

  // Toggle dropdown with animation
  const toggleDropdown = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);

    Animated.timing(animatedHeight, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Calculate dropdown height
  const propertyCount = availableProperties.length;
  const dropdownBaseHeight = propertyCount * 60 + (showAddButton ? 70 : 20);
  const warningHeight = showAllPropertiesWarning ? 80 : 0;

  const dropdownHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.min(dropdownBaseHeight + warningHeight, 350)],
  });

  // Get action context display text
  const getActionContextText = () => {
    switch (actionContext) {
      case 'add-room':
        return 'to add a room';
      case 'add-tenant':
        return 'to add a tenant';
      case 'add-ticket':
        return 'to create a ticket';
      case 'manage-rooms':
        return 'to manage rooms';
      case 'manage-tenants':
        return 'to manage tenants';
      case 'manage-tickets':
        return 'to manage tickets';
      default:
        return 'for this action';
    }
  };

  return (
    <View style={styles.container}>
      {/* Main Property Selector Card */}
      <Card
        style={[styles.selectorCard, { backgroundColor: cardBackground }]}
        elevation={2}
      >
        <TouchableOpacity
          style={styles.selectorButton}
          onPress={toggleDropdown}
          activeOpacity={0.7}
        >
          <View style={styles.selectorContent}>
            <View style={styles.propertyInfo}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.primary + '15' },
                ]}
              >
                <MaterialCommunityIcons
                  name={isAllPropertiesSelected ? 'view-dashboard' : 'home'}
                  size={22}
                  color={colors.primary}
                />
              </View>
              <View style={styles.textContainer}>
                {showTitle && (
                  <StandardText
                    style={[styles.selectorLabel, { color: textSecondary }]}
                    fontWeight="medium"
                    size="xs"
                  >
                    {requireSpecificProperty
                      ? `Select Property ${getActionContextText()}`
                      : 'Current Property'}
                  </StandardText>
                )}
                <StandardText
                  style={[
                    styles.selectorText,
                    {
                      color: showAllPropertiesWarning
                        ? colors.warning
                        : textPrimary,
                    },
                  ]}
                  fontWeight="bold"
                  numberOfLines={1}
                >
                  {selectedProperty?.name || 'All Properties'}
                </StandardText>
                {selectedProperty && selectedProperty.property_id !== 'all' && (
                  <StandardText
                    style={[styles.addressText, { color: textSecondary }]}
                    size="xs"
                    numberOfLines={1}
                  >
                    {selectedProperty.city
                      ? `${selectedProperty.city}, ${selectedProperty.state}`
                      : 'No location'}
                  </StandardText>
                )}
                {/* {showAllPropertiesWarning && (
                  <StandardText
                    style={[styles.warningText, { color: colors.warning }]}
                    size="xs"
                    fontWeight="medium"
                  >
                    Please select a specific property
                  </StandardText>
                )} */}
              </View>
            </View>
            <View style={styles.actionContainer}>
              <StandardText
                style={[styles.actionText, { color: colors.primary }]}
                fontWeight="medium"
                size="sm"
              >
                {isExpanded ? 'Close' : 'Switch'}
              </StandardText>
              <MaterialCommunityIcons
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={colors.primary}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Dropdown Content */}
        <Animated.View
          style={[
            styles.dropdownContainer,
            {
              height: dropdownHeight,
              backgroundColor: cardBackground,
            },
          ]}
        >
          <ScrollView
            style={styles.dropdownScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {/* Warning message for action screens when "All Properties" is selected */}
            {showAllPropertiesWarning && (
              <View style={styles.warningContainer}>
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={16}
                  color={colors.warning}
                />
                <StandardText
                  style={[styles.warningMessage, { color: colors.warning }]}
                  size="xs"
                  fontWeight="medium"
                >
                  You need to select a specific property{' '}
                  {getActionContextText()}
                </StandardText>
              </View>
            )}

            {availableProperties.map(property => {
              const isSelected =
                selectedProperty?.property_id === property.property_id;
              return (
                <TouchableOpacity
                  key={property.property_id}
                  style={[
                    styles.propertyItem,
                    isSelected && styles.selectedPropertyItem,
                  ]}
                  onPress={() => handlePropertySelect(property)}
                  activeOpacity={0.7}
                >
                  <View style={styles.propertyItemContent}>
                    <MaterialCommunityIcons
                      name={
                        property.property_id === 'all'
                          ? 'view-dashboard'
                          : 'home'
                      }
                      size={20}
                      color={isSelected ? colors.primary : textSecondary}
                    />
                    <View style={styles.propertyDetails}>
                      <StandardText
                        style={[
                          styles.propertyName,
                          { color: isSelected ? colors.primary : textPrimary },
                        ]}
                        fontWeight={isSelected ? 'bold' : 'medium'}
                      >
                        {property.name}
                      </StandardText>
                      {property.property_id !== 'all' ? (
                        <StandardText
                          style={[
                            styles.propertyAddress,
                            { color: textSecondary },
                          ]}
                          size="xs"
                          numberOfLines={1}
                        >
                          {property.city
                            ? `${property.city}, ${property.state}`
                            : property.address || 'No address'}
                        </StandardText>
                      ) : (
                        <StandardText
                          style={[
                            styles.propertyAddress,
                            { color: textSecondary },
                          ]}
                          size="xs"
                        >
                          View combined analytics
                        </StandardText>
                      )}
                    </View>
                    {isSelected && (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={18}
                        color={colors.primary}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Add Property Button */}
            {showAddButton && (
              <TouchableOpacity
                style={styles.addPropertyButton}
                onPress={handleAddProperty}
                activeOpacity={0.7}
              >
                <View style={styles.addPropertyContent}>
                  <View
                    style={[
                      styles.addIconContainer,
                      { backgroundColor: colors.success + '15' },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={20}
                      color={colors.success}
                    />
                  </View>
                  <View style={styles.addPropertyDetails}>
                    <StandardText
                      style={[
                        styles.addPropertyText,
                        { color: colors.success },
                      ]}
                      fontWeight="bold"
                    >
                      Add New Property
                    </StandardText>
                    <StandardText
                      style={[
                        styles.addPropertySubtext,
                        { color: textSecondary },
                      ]}
                      size="xs"
                    >
                      Create a new property to manage
                    </StandardText>
                  </View>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={18}
                    color={colors.success}
                  />
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  selectorCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectorButton: {
    padding: 16,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  propertyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 2,
  },
  selectorText: {
    fontSize: 16,
    lineHeight: 20,
  },
  addressText: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
  warningText: {
    fontSize: 10,
    lineHeight: 12,
    marginTop: 2,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  actionText: {
    marginRight: 6,
  },
  dropdownContainer: {
    overflow: 'hidden',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dropdownScroll: {
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    margin: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  warningMessage: {
    marginLeft: 8,
    flex: 1,
  },
  propertyItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedPropertyItem: {
    backgroundColor: colors.primary + '08',
  },
  propertyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  propertyDetails: {
    flex: 1,
    marginLeft: 12,
  },
  propertyName: {
    fontSize: 14,
    lineHeight: 18,
  },
  propertyAddress: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
  addPropertyButton: {
    margin: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.success + '08',
    borderWidth: 1,
    borderColor: colors.success + '20',
    borderStyle: 'dashed',
  },
  addPropertyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addPropertyDetails: {
    flex: 1,
  },
  addPropertyText: {
    fontSize: 14,
    lineHeight: 18,
  },
  addPropertySubtext: {
    fontSize: 11,
    lineHeight: 14,
    marginTop: 2,
  },
});

export default PropertySelector;
