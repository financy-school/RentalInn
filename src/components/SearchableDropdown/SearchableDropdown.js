import React, { useState, useContext } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
  Pressable,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../context/ThemeContext';
import StandardText from '../StandardText/StandardText';
import colors from '../../theme/colors';

const SearchableDropdown = ({
  items = [],
  selectedValue,
  onValueChange,
  placeholder = 'Select an option',
  searchPlaceholder = 'Search...',
  disabled = false,
  leftIcon,
  style,
  containerStyle,
}) => {
  const { theme: mode } = useContext(ThemeContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;
  const borderColor = isDark ? colors.gray : colors.border;

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Get selected item label
  const selectedLabel =
    items.find(item => item.value === selectedValue)?.label || '';

  const handleSelect = value => {
    onValueChange(value);
    setModalVisible(false);
    setSearchQuery('');
  };

  const openModal = () => {
    if (!disabled) {
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSearchQuery('');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, { borderBottomColor: borderColor }]}
      onPress={() => handleSelect(item.value)}
    >
      <StandardText style={[styles.dropdownItemText, { color: textPrimary }]}>
        {item.label}
      </StandardText>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        style={[
          styles.dropdown,
          {
            borderColor: borderColor,
            backgroundColor: cardBackground,
          },
          disabled && styles.disabledDropdown,
          containerStyle,
        ]}
        onPress={openModal}
        disabled={disabled}
      >
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={20}
            color={textSecondary}
            style={styles.leftIcon}
          />
        )}
        <StandardText
          style={[
            styles.dropdownText,
            { color: selectedValue ? textPrimary : textSecondary },
            style,
          ]}
          numberOfLines={1}
        >
          {selectedLabel || placeholder}
        </StandardText>
        <MaterialCommunityIcons
          name="chevron-down"
          size={20}
          color={textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable
            style={[styles.modalContent, { backgroundColor: cardBackground }]}
            onPress={e => e.stopPropagation()}
          >
            {/* Header */}
            <View
              style={[styles.modalHeader, { borderBottomColor: borderColor }]}
            >
              <StandardText
                style={[styles.modalTitle, { color: textPrimary }]}
                fontWeight="bold"
              >
                {placeholder}
              </StandardText>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View
              style={[
                styles.searchContainer,
                { borderBottomColor: borderColor },
              ]}
            >
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color={textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: textPrimary }]}
                placeholder={searchPlaceholder}
                placeholderTextColor={textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <MaterialCommunityIcons
                    name="close-circle"
                    size={20}
                    color={textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Items List */}
            <FlatList
              data={filteredItems}
              renderItem={renderItem}
              keyExtractor={item => item.value}
              style={styles.itemsList}
              showsVerticalScrollIndicator={false}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    minHeight: 52,
    marginTop: 4,
  },
  disabledDropdown: {
    opacity: 0.6,
  },
  leftIcon: {
    marginRight: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Metropolis-Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 12,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Metropolis-Regular',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  itemsList: {
    maxHeight: 400,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: 'Metropolis-Regular',
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Metropolis-Medium',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: 'Metropolis-Regular',
    marginTop: 4,
  },
});

export default SearchableDropdown;
