import React, { useContext, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import StandardText from '../StandardText/StandardText';
import colors from '../../theme/color';
import { ThemeContext } from '../../context/ThemeContext';
import { useProperty } from '../../context/PropertyContext';

const PropertySelector = ({
  navigation,
  showAddButton = true,
  showTitle = true,
}) => {
  const { theme: mode } = useContext(ThemeContext);
  const {
    properties,
    selectedProperty,
    switchProperty,
    isAllPropertiesSelected,
    hasProperties,
  } = useProperty();

  const [modalVisible, setModalVisible] = useState(false);

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;
  const modalBackgroundColor = isDark
    ? 'rgba(0, 0, 0, 0.8)'
    : 'rgba(0, 0, 0, 0.5)';

  // Handle property selection
  const handlePropertySelect = async property => {
    try {
      await switchProperty(property);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to switch property');
      console.error('Property switch error:', error);
    }
  };

  // Handle add property
  const handleAddProperty = () => {
    setModalVisible(false);
    navigation.navigate('AddProperty');
  };

  return (
    <View style={styles.container}>
      {/* Property Selector Button */}
      <TouchableOpacity
        style={[styles.selectorButton, { backgroundColor: cardBackground }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.selectorContent}>
          <View style={styles.propertyInfo}>
            <MaterialCommunityIcons
              name={isAllPropertiesSelected ? 'view-dashboard' : 'home'}
              size={20}
              color={colors.primary}
            />
            <View style={styles.textContainer}>
              {showTitle && (
                <StandardText
                  style={[styles.selectorLabel, { color: textSecondary }]}
                  fontWeight="medium"
                >
                  Property
                </StandardText>
              )}
              <StandardText
                style={[styles.selectorText, { color: textPrimary }]}
                fontWeight="bold"
                numberOfLines={1}
              >
                {selectedProperty?.name || 'All Properties'}
              </StandardText>
            </View>
          </View>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Property Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            { backgroundColor: modalBackgroundColor },
          ]}
        >
          <View
            style={[styles.modalContent, { backgroundColor: cardBackground }]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <StandardText
                style={[styles.modalTitle, { color: textPrimary }]}
                fontWeight="bold"
              >
                Select Property
              </StandardText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={textSecondary}
                />
              </TouchableOpacity>
            </View>

            <Divider style={{ backgroundColor: colors.border }} />

            {/* Property List */}
            <ScrollView
              style={styles.propertyList}
              showsVerticalScrollIndicator={false}
            >
              {properties.map((property, index) => {
                const isSelected = selectedProperty?.id === property.id;
                const itemBackgroundColor = isSelected
                  ? colors.primary + '10'
                  : 'transparent';

                return (
                  <TouchableOpacity
                    key={property.id}
                    style={[
                      styles.propertyItem,
                      isSelected && styles.selectedPropertyItem,
                      { backgroundColor: itemBackgroundColor },
                    ]}
                    onPress={() => handlePropertySelect(property)}
                  >
                    <View style={styles.propertyItemContent}>
                      <MaterialCommunityIcons
                        name={property.id === 'all' ? 'view-dashboard' : 'home'}
                        size={24}
                        color={
                          selectedProperty?.id === property.id
                            ? colors.primary
                            : textSecondary
                        }
                      />
                      <View style={styles.propertyDetails}>
                        <StandardText
                          style={[
                            styles.propertyName,
                            {
                              color:
                                selectedProperty?.id === property.id
                                  ? colors.primary
                                  : textPrimary,
                            },
                          ]}
                          fontWeight={
                            selectedProperty?.id === property.id
                              ? 'bold'
                              : 'medium'
                          }
                        >
                          {property.name}
                        </StandardText>
                        {property.id !== 'all' && (
                          <StandardText
                            style={[
                              styles.propertyAddress,
                              { color: textSecondary },
                            ]}
                            numberOfLines={1}
                          >
                            {property.city
                              ? `${property.city}, ${property.state}`
                              : property.address}
                          </StandardText>
                        )}
                        {property.id === 'all' && (
                          <StandardText
                            style={[
                              styles.propertyAddress,
                              { color: textSecondary },
                            ]}
                          >
                            Combined analytics for all properties
                          </StandardText>
                        )}
                      </View>
                      {selectedProperty?.id === property.id && (
                        <MaterialCommunityIcons
                          name="check-circle"
                          size={20}
                          color={colors.primary}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* No Properties Message */}
              {!hasProperties && (
                <View style={styles.noPropertiesContainer}>
                  <MaterialCommunityIcons
                    name="home-plus-outline"
                    size={48}
                    color={textSecondary}
                  />
                  <StandardText
                    style={[styles.noPropertiesText, { color: textSecondary }]}
                    fontWeight="medium"
                  >
                    No properties added yet
                  </StandardText>
                  <StandardText
                    style={[
                      styles.noPropertiesSubtext,
                      { color: textSecondary },
                    ]}
                  >
                    Add your first property to get started
                  </StandardText>
                </View>
              )}
            </ScrollView>

            {/* Add Property Button */}
            {showAddButton && (
              <>
                <Divider style={{ backgroundColor: colors.border }} />
                <TouchableOpacity
                  style={styles.addPropertyButton}
                  onPress={handleAddProperty}
                >
                  <MaterialCommunityIcons
                    name="plus"
                    size={20}
                    color={colors.primary}
                  />
                  <StandardText
                    style={[styles.addPropertyText, { color: colors.primary }]}
                    fontWeight="bold"
                  >
                    Add New Property
                  </StandardText>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  selectorButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
  textContainer: {
    marginLeft: 8,
    flex: 1,
  },
  selectorLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  selectorText: {
    fontSize: 14,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 12,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
  },
  closeButton: {
    padding: 4,
  },
  propertyList: {
    maxHeight: 400,
  },
  propertyItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 0,
  },
  selectedPropertyItem: {
    borderRadius: 0,
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
    fontSize: 16,
    lineHeight: 20,
  },
  propertyAddress: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  noPropertiesContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noPropertiesText: {
    fontSize: 16,
    marginTop: 12,
  },
  noPropertiesSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  addPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  addPropertyText: {
    fontSize: 16,
    marginLeft: 8,
  },
});

export default PropertySelector;
