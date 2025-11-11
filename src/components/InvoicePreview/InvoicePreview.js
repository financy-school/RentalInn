import React, { useContext } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Divider } from 'react-native-paper';
import { ThemeContext } from '../../context/ThemeContext';
import StandardText from '../StandardText/StandardText';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import colors from '../../theme/colors';

const InvoicePreview = ({ items, totalAmount, dueDate, tenantName }) => {
  const { theme: mode } = useContext(ThemeContext);
  const isDark = mode === 'dark';

  const formatDate = date => {
    if (!date) return 'Not set';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? colors.backgroundDark : colors.white },
      ]}
    >
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="file-document-outline"
          size={24}
          color={colors.primary}
        />
        <StandardText
          style={[
            styles.title,
            { color: isDark ? colors.white : colors.textPrimary },
          ]}
          fontWeight="bold"
        >
          Invoice Preview
        </StandardText>
      </View>

      <View
        style={[
          styles.infoRow,
          {
            backgroundColor: isDark ? colors.backgroundDark : colors.background,
          },
        ]}
      >
        <StandardText
          style={[
            styles.infoLabel,
            { color: isDark ? colors.light_gray : colors.textSecondary },
          ]}
        >
          Tenant
        </StandardText>
        <StandardText
          style={[
            styles.infoValue,
            { color: isDark ? colors.white : colors.textPrimary },
          ]}
          fontWeight="medium"
        >
          {tenantName}
        </StandardText>
      </View>

      <View
        style={[
          styles.infoRow,
          {
            backgroundColor: isDark ? colors.backgroundDark : colors.background,
          },
        ]}
      >
        <StandardText
          style={[
            styles.infoLabel,
            { color: isDark ? colors.light_gray : colors.textSecondary },
          ]}
        >
          Due Date
        </StandardText>
        <StandardText
          style={[styles.infoValue, { color: colors.warning }]}
          fontWeight="medium"
        >
          {formatDate(dueDate)}
        </StandardText>
      </View>

      <Divider style={styles.divider} />

      <StandardText
        style={[
          styles.sectionTitle,
          { color: isDark ? colors.white : colors.textPrimary },
        ]}
        fontWeight="bold"
      >
        Invoice Items
      </StandardText>

      <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
        {items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemLeft}>
              <StandardText
                style={[
                  styles.itemCategory,
                  { color: isDark ? colors.white : colors.textPrimary },
                ]}
                fontWeight="medium"
              >
                {item.category}
              </StandardText>
              {item.description && (
                <StandardText
                  style={[
                    styles.itemDescription,
                    {
                      color: isDark ? colors.light_gray : colors.textSecondary,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.description}
                </StandardText>
              )}
            </View>
            <StandardText
              style={[
                styles.itemAmount,
                { color: isDark ? colors.white : colors.textPrimary },
              ]}
              fontWeight="bold"
            >
              ₹{item.amount.toLocaleString()}
            </StandardText>
          </View>
        ))}
      </ScrollView>

      <Divider style={styles.divider} />

      <View style={styles.totalRow}>
        <StandardText
          style={[
            styles.totalLabel,
            { color: isDark ? colors.white : colors.textPrimary },
          ]}
          fontWeight="bold"
        >
          Total Amount
        </StandardText>
        <StandardText
          style={[styles.totalAmount, { color: colors.primary }]}
          fontWeight="bold"
        >
          ₹{totalAmount.toLocaleString()}
        </StandardText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 14,
  },
  divider: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  itemsList: {
    maxHeight: 200,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemLeft: {
    flex: 1,
    marginRight: 12,
  },
  itemCategory: {
    fontSize: 14,
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 12,
  },
  itemAmount: {
    fontSize: 15,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 22,
  },
});

export default InvoicePreview;
