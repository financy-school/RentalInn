import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import { CredentialsContext } from '../context/CredentialsContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import Gap from '../components/Gap/Gap';
import BeautifulDatePicker from '../components/BeautifulDatePicker';
import InvoiceTemplateCard from '../components/InvoiceTemplateCard/InvoiceTemplateCard';
import TenantPaymentSummary from '../components/TenantPaymentSummary/TenantPaymentSummary';
import BillCategoryCard from '../components/BillCategoryCard/BillCategoryCard';
import InvoicePreview from '../components/InvoicePreview/InvoicePreview';
import AnimatedLoader from '../components/AnimatedLoader/AnimatedLoader';
import {
  getTenantInvoiceData,
  getTenant,
  createInvoice,
  createQuickMonthlyRent,
  createQuickMoveIn,
  createQuickUtilities,
} from '../services/NetworkUtils';
import colors from '../theme/colors';
import helpers from '../navigation/helpers';

const { ErrorHelper } = helpers;

const AddInvoiceNew = ({ navigation, route }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);
  const { tenant_id } = route.params;

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tenantData, setTenantData] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [viewMode, setViewMode] = useState('quick'); // 'quick' or 'custom'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Custom invoice state
  const [billCategories, setBillCategories] = useState([]);

  // Category icons mapping
  const categoryIcons = {
    Rent: 'home',
    'Security Deposit': 'shield-check',
    'Joining Fee': 'account-plus',
    Electricity: 'flash',
    Water: 'water',
    Maintenance: 'tools',
    Internet: 'wifi',
    'Late Fee': 'clock-alert',
    Other: 'dots-horizontal',
  };

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [tenantResponse, invoiceDataResponse] = await Promise.all([
        getTenant(credentials.accessToken, tenant_id),
        getTenantInvoiceData(credentials.accessToken, tenant_id),
      ]);

      if (tenantResponse.success && tenantResponse.data) {
        setTenantData(tenantResponse.data);
      }

      if (invoiceDataResponse.success && invoiceDataResponse.data) {
        setInvoiceData(invoiceDataResponse.data);
        initializeBillCategories(invoiceDataResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load invoice data');
    } finally {
      setLoading(false);
    }
  }, [credentials.accessToken, tenant_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Initialize bill categories from API data
  const initializeBillCategories = data => {
    const categories = [
      {
        id: 'rent',
        category: 'Rent',
        icon: 'home',
        amount: data.tenant?.rent_amount || 0,
        existingDues: 0,
        existingDueDate: null,
        description: `Monthly rent for ${new Date().toLocaleDateString(
          'en-US',
          { month: 'long' },
        )}`,
        isSelected: false,
        dueDate:
          data.smartSuggestions?.optimalDueDate ||
          new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'security',
        category: 'Security Deposit',
        icon: 'shield-check',
        amount: 0,
        existingDues: 0,
        existingDueDate: null,
        description: 'Security deposit (refundable)',
        isSelected: false,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'electricity',
        category: 'Electricity',
        icon: 'flash',
        amount: 0,
        existingDues: 0,
        existingDueDate: null,
        description: 'Electricity bill',
        isSelected: false,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'water',
        category: 'Water',
        icon: 'water',
        amount: 0,
        existingDues: 0,
        existingDueDate: null,
        description: 'Water bill',
        isSelected: false,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'maintenance',
        category: 'Maintenance',
        icon: 'tools',
        amount: 0,
        existingDues: 0,
        existingDueDate: null,
        description: 'Maintenance charges',
        isSelected: false,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
    ];

    // Map pending items to categories
    if (data.pendingItems?.items) {
      data.pendingItems.items.forEach(item => {
        const category = categories.find(
          c => c.category.toLowerCase() === item.category.toLowerCase(),
        );
        if (category) {
          category.existingDues = item.pendingAmount;
          category.existingDueDate = item.dueDate;
        }
      });
    }

    setBillCategories(categories);
  };

  // Quick invoice handlers
  // Quick invoice handler
  const handleQuickInvoice = async actionType => {
    try {
      setSubmitting(true);

      let response;
      switch (actionType) {
        case 'MONTHLY_RENT':
          response = await createQuickMonthlyRent(
            credentials.accessToken,
            tenant_id,
            new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
            'Monthly rent payment',
          );
          break;
        case 'MOVE_IN':
          response = await createQuickMoveIn(
            credentials.accessToken,
            tenant_id,
            tenantData?.check_in_date || new Date(),
            'Move-in charges',
          );
          break;
        case 'UTILITIES':
          response = await createQuickUtilities(
            credentials.accessToken,
            tenant_id,
            new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            'Utility bills',
          );
          break;
      }

      if (response.success) {
        ErrorHelper.showToast('Invoice created successfully!', 'success');
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        ErrorHelper.showToast(
          response.error || 'Failed to create invoice',
          'error',
        );
      }
    } catch (error) {
      console.error('Error creating quick invoice:', error);
      ErrorHelper.showToast('An unexpected error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Custom invoice handlers
  const toggleCategory = id => {
    setBillCategories(prev =>
      prev.map(cat =>
        cat.id === id ? { ...cat, isSelected: !cat.isSelected } : cat,
      ),
    );
  };

  const updateAmount = (id, amount) => {
    setBillCategories(prev =>
      prev.map(cat => (cat.id === id ? { ...cat, amount } : cat)),
    );
  };

  const openDatePicker = id => {
    setSelectedBillId(id);
    setShowDatePicker(true);
  };

  const handleDateSelect = date => {
    if (selectedBillId) {
      setBillCategories(prev =>
        prev.map(cat =>
          cat.id === selectedBillId ? { ...cat, dueDate: new Date(date) } : cat,
        ),
      );
    }
    setShowDatePicker(false);
    setSelectedBillId(null);
  };

  const handleCustomInvoiceSubmit = async () => {
    const selectedBills = billCategories.filter(
      cat => cat.isSelected && cat.amount > 0,
    );

    if (selectedBills.length === 0) {
      Alert.alert(
        'Error',
        'Please select at least one bill category with amount',
      );
      return;
    }

    try {
      setSubmitting(true);

      const categoryMapping = {
        Rent: 'RENT',
        'Security Deposit': 'SECURITY_DEPOSIT',
        'Joining Fee': 'JOINING_FEE',
        Electricity: 'ELECTRICITY',
        Water: 'WATER',
        Maintenance: 'MAINTENANCE',
        Internet: 'INTERNET',
        'Late Fee': 'LATE_FEE',
        Other: 'OTHER',
      };

      const invoicePayload = {
        tenant_id: tenant_id,
        rental_id: tenantData?.rentals?.[0]?.rental_id,
        dueDate: selectedBills[0].dueDate,
        description: `Invoice for ${tenantData?.name}`,
        items: selectedBills.map(bill => ({
          category: categoryMapping[bill.category] || 'OTHER',
          description: bill.description,
          amount: parseFloat(bill.amount) || 0,
          existingDues: bill.existingDues || 0,
          dueDate: bill.dueDate,
          quantity: 1,
          metadata: {},
        })),
      };

      const response = await createInvoice(
        credentials.accessToken,
        invoicePayload,
      );

      if (response.success) {
        ErrorHelper.showToast('Invoice created successfully!', 'success');
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        ErrorHelper.showToast(
          response.error || 'Failed to create invoice',
          'error',
        );
      }
    } catch (error) {
      console.error('Error creating custom invoice:', error);
      ErrorHelper.showToast('An unexpected error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTotal = () => {
    return billCategories
      .filter(cat => cat.isSelected)
      .reduce((sum, cat) => sum + (parseFloat(cat.amount) || 0), 0);
  };

  const getSelectedItems = () => {
    return billCategories
      .filter(cat => cat.isSelected && cat.amount > 0)
      .map(cat => ({
        category: cat.category,
        description: cat.description,
        amount: cat.amount,
      }));
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StandardHeader navigation={navigation} title="Add Invoice" />
        <AnimatedLoader
          message="Loading invoice data..."
          icon="file-document"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StandardHeader
        navigation={navigation}
        title="Add Invoice"
        loading={submitting}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Tenant Info */}
        <View style={[styles.tenantCard, { backgroundColor: cardBackground }]}>
          <View style={styles.tenantHeader}>
            <View style={styles.tenantAvatar}>
              <MaterialCommunityIcons
                name="account"
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.tenantInfo}>
              <StandardText
                style={[styles.tenantName, { color: textPrimary }]}
                fontWeight="bold"
              >
                {tenantData?.name}
              </StandardText>
              <StandardText
                style={[styles.tenantDetail, { color: textSecondary }]}
              >
                Room: {tenantData?.room?.name || 'N/A'}
              </StandardText>
            </View>
          </View>
        </View>

        <Gap size="md" />

        {/* Payment Summary */}
        {invoiceData?.paymentReliability && (
          <TenantPaymentSummary
            paymentReliability={invoiceData.paymentReliability}
            pendingAmount={invoiceData.pendingItems?.totalPendingAmount || 0}
            lastPaymentDate={
              invoiceData.paymentHistory?.recentPayments?.[0]?.paymentDate
            }
            lastPaymentAmount={
              invoiceData.paymentHistory?.recentPayments?.[0]?.amount || 0
            }
          />
        )}

        {/* Mode Toggle */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              viewMode === 'quick' && styles.modeButtonActive,
              {
                backgroundColor:
                  viewMode === 'quick' ? colors.primary : cardBackground,
              },
            ]}
            onPress={() => setViewMode('quick')}
          >
            <MaterialCommunityIcons
              name="flash"
              size={20}
              color={viewMode === 'quick' ? colors.white : textSecondary}
            />
            <StandardText
              style={[
                styles.modeButtonText,
                { color: viewMode === 'quick' ? colors.white : textSecondary },
              ]}
              fontWeight={viewMode === 'quick' ? 'bold' : 'regular'}
            >
              Quick Actions
            </StandardText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeButton,
              viewMode === 'custom' && styles.modeButtonActive,
              {
                backgroundColor:
                  viewMode === 'custom' ? colors.primary : cardBackground,
              },
            ]}
            onPress={() => setViewMode('custom')}
          >
            <MaterialCommunityIcons
              name="tune"
              size={20}
              color={viewMode === 'custom' ? colors.white : textSecondary}
            />
            <StandardText
              style={[
                styles.modeButtonText,
                { color: viewMode === 'custom' ? colors.white : textSecondary },
              ]}
              fontWeight={viewMode === 'custom' ? 'bold' : 'regular'}
            >
              Custom Invoice
            </StandardText>
          </TouchableOpacity>
        </View>

        <Gap size="lg" />

        {/* Quick Actions Mode */}
        {viewMode === 'quick' && invoiceData?.quickActions && (
          <View>
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Quick Invoice Templates
            </StandardText>
            <Gap size="sm" />
            {invoiceData.quickActions.map((action, index) => (
              <InvoiceTemplateCard
                key={index}
                type={action.type}
                label={action.label}
                icon={action.icon}
                amount={action.amount}
                description={action.description}
                onPress={() => handleQuickInvoice(action.type)}
                disabled={submitting}
              />
            ))}
          </View>
        )}

        {/* Custom Invoice Mode */}
        {viewMode === 'custom' && (
          <View>
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Select Bill Categories
            </StandardText>
            <Gap size="sm" />

            {billCategories.map(category => (
              <BillCategoryCard
                key={category.id}
                category={category.category}
                icon={category.icon}
                amount={category.amount}
                existingDues={category.existingDues}
                existingDueDate={category.existingDueDate}
                description={category.description}
                isSelected={category.isSelected}
                onToggle={() => toggleCategory(category.id)}
                onAmountChange={amount => updateAmount(category.id, amount)}
                onDatePress={() => openDatePicker(category.id)}
                dueDate={category.dueDate}
              />
            ))}

            <Gap size="lg" />

            {/* Preview Section */}
            {getSelectedItems().length > 0 && (
              <>
                <TouchableOpacity
                  style={styles.previewToggle}
                  onPress={() => setShowPreview(!showPreview)}
                >
                  <StandardText
                    style={[
                      styles.previewToggleText,
                      { color: colors.primary },
                    ]}
                    fontWeight="bold"
                  >
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </StandardText>
                  <MaterialCommunityIcons
                    name={showPreview ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color={colors.primary}
                  />
                </TouchableOpacity>

                {showPreview && (
                  <InvoicePreview
                    items={getSelectedItems()}
                    totalAmount={calculateTotal()}
                    dueDate={billCategories.find(c => c.isSelected)?.dueDate}
                    tenantName={tenantData?.name}
                  />
                )}
              </>
            )}

            {/* Submit Button */}
            <Button
              mode="contained"
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              labelStyle={styles.submitButtonText}
              onPress={handleCustomInvoiceSubmit}
              loading={submitting}
              disabled={submitting || calculateTotal() === 0}
            >
              Create Invoice - ₹
              {calculateTotal().toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 0,
              })}
            </Button>
          </View>
        )}

        <Gap size="xxl" />
      </ScrollView>

      {/* Date Picker */}
      <BeautifulDatePicker
        visible={showDatePicker}
        onDismiss={() => {
          setShowDatePicker(false);
          setSelectedBillId(null);
        }}
        onDateSelect={handleDateSelect}
        title="Select Due Date"
        minDate={new Date()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tenantCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tenantAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 20,
    marginBottom: 4,
  },
  tenantDetail: {
    fontSize: 14,
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  modeButtonActive: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modeButtonText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 12,
  },
  previewToggleText: {
    fontSize: 16,
    marginRight: 8,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 4,
    marginTop: 16,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Metropolis-Bold',
  },
});

export default AddInvoiceNew;
