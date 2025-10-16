import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Button, TextInput as PaperInput, Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StandardCard from '../components/StandardCard/StandardCard';
import AnimatedLoader from '../components/AnimatedLoader/AnimatedLoader';
import { CredentialsContext } from '../context/CredentialsContext';
import BeautifulDatePicker from '../components/BeautifulDatePicker';
import SearchableDropdown from '../components/SearchableDropdown/SearchableDropdown';
import StyledTextInput from '../components/StyledTextInput/StyledTextInput';
import Gap from '../components/Gap/Gap';
import colors from '../theme/colors';
import { RADIUS, SHADOW } from '../theme/layout';
import helpers from '../navigation/helpers';
import { useProperty } from '../context/PropertyContext';
import PropertySelector from '../components/PropertySelector/PropertySelector';
import {
  createExpense,
  getExpenseCategories,
  updateExpense,
} from '../services/NetworkUtils';

const { ErrorHelper } = helpers;

const AddExpense = ({ navigation, route }) => {
  const { credentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);
  const expenseToEdit = route?.params?.expense;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState([]);
  const { selectedProperty, isAllPropertiesSelected } = useProperty();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [vendorContact, setVendorContact] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );
  const [priority, setPriority] = useState('MEDIUM');
  const [status, setStatus] = useState('PENDING');
  const [notes, setNotes] = useState('');
  const [showExpenseDatePicker, setShowExpenseDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  const priorityOptions = [
    { key: 'LOW', label: 'Low', color: colors.success },
    { key: 'MEDIUM', label: 'Medium', color: colors.warning },
    { key: 'HIGH', label: 'High', color: colors.error },
    { key: 'URGENT', label: 'Urgent', color: colors.error },
  ];

  const statusOptions = [
    { key: 'DRAFT', label: 'Draft', color: colors.textSecondary },
    { key: 'PENDING', label: 'Pending', color: colors.warning },
    { key: 'PAID', label: 'Paid', color: colors.success },
  ];

  // Fetch properties and categories
  const fetchData = useCallback(async () => {
    if (!credentials?.accessToken) return;

    try {
      setLoading(true);

      // Fetch expense categories
      const categoriesResponse = await getExpenseCategories(
        credentials.accessToken,
      );

      console.log('Fetched categories:', categoriesResponse);

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(
          categoriesResponse.data.map(cat => ({
            label: cat.name,
            value: cat.category_id,
            icon: cat.icon,
            color: cat.color,
          })),
        );
      }

      // If editing, populate form
      if (expenseToEdit) {
        setSelectedCategory(expenseToEdit.category_id);
        setTitle(expenseToEdit.title || '');
        setDescription(expenseToEdit.description || '');
        setAmount(expenseToEdit.amount?.toString() || '');
        setVendorName(expenseToEdit.vendor_name || '');
        setVendorContact(expenseToEdit.vendor_contact || '');
        setInvoiceNumber(expenseToEdit.invoice_number || '');
        setExpenseDate(expenseToEdit.expense_date?.split('T')[0] || '');
        setDueDate(expenseToEdit.due_date?.split('T')[0] || '');
        setPriority(expenseToEdit.priority || 'MEDIUM');
        setStatus(expenseToEdit.status || 'PENDING');
        setNotes(expenseToEdit.notes || '');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      ErrorHelper.logError(error, 'FETCH_ADD_EXPENSE_DATA');
      ErrorHelper.showToast('Failed to load form data', 'error');
    } finally {
      setLoading(false);
    }
  }, [credentials, expenseToEdit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Validate form
  const validateForm = () => {
    if (!selectedProperty || selectedProperty.property_id === 'all') {
      ErrorHelper.showToast('Please select a specific property', 'warning');
      return false;
    }
    if (!selectedCategory) {
      ErrorHelper.showToast('Please select a category', 'warning');
      return false;
    }
    if (!title.trim()) {
      ErrorHelper.showToast('Please enter expense title', 'warning');
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      ErrorHelper.showToast('Please enter a valid amount', 'warning');
      return false;
    }
    if (!expenseDate) {
      ErrorHelper.showToast('Please select expense date', 'warning');
      return false;
    }
    if (!dueDate) {
      ErrorHelper.showToast('Please select due date', 'warning');
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const expenseData = {
        property_id: selectedProperty.property_id,
        category_id: selectedCategory,
        title: title.trim(),
        description: description.trim(),
        amount: parseFloat(amount),
        vendor_name: vendorName.trim(),
        vendor_phone: vendorContact.trim(),
        invoice_number: invoiceNumber.trim(),
        expense_date: expenseDate,
        due_date: dueDate,
        priority,
        status,
        notes: notes.trim(),
      };

      let response;
      if (expenseToEdit) {
        response = await updateExpense(
          credentials.accessToken,
          expenseToEdit.expense_id,
          expenseData,
        );
      } else {
        response = await createExpense(credentials.accessToken, expenseData);
      }

      if (response.success) {
        ErrorHelper.showToast(
          expenseToEdit
            ? 'Expense updated successfully'
            : 'Expense created successfully',
          'success',
        );
        navigation.goBack();
      } else {
        ErrorHelper.showToast(
          response.error || 'Failed to save expense',
          'error',
        );
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      ErrorHelper.logError(error, 'SAVE_EXPENSE');
      ErrorHelper.showToast('Failed to save expense', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StandardHeader
          navigation={navigation}
          title={expenseToEdit ? 'Edit Expense' : 'Add Expense'}
          subtitle="Expense details"
          showBackButton
        />
        <AnimatedLoader
          message="Loading form..."
          icon="form"
          fullScreen={false}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StandardHeader
        navigation={navigation}
        title={expenseToEdit ? 'Edit Expense' : 'Add Expense'}
        subtitle="Fill in expense details"
        showBackButton
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <PropertySelector
          navigation={navigation}
          requireSpecificProperty={true}
          actionContext="add-room"
          showAddButton={true}
          showTitle={true}
        />

        <Gap size="md" />

        {/* Category Selection */}
        <StandardCard
          style={[styles.card, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="tag"
              size={20}
              color={colors.primary}
            />
            <StandardText
              fontWeight="bold"
              size="md"
              style={{ color: textPrimary, marginLeft: 8 }}
            >
              Category *
            </StandardText>
          </View>
          <Gap size="sm" />
          <SearchableDropdown
            items={categories}
            selectedValue={selectedCategory}
            onValueChange={setSelectedCategory}
            placeholder="Select category"
            searchPlaceholder="Search categories..."
          />
        </StandardCard>

        <Gap size="md" />

        {/* Basic Information */}
        <StandardCard
          style={[styles.card, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="information"
              size={20}
              color={colors.primary}
            />
            <StandardText
              fontWeight="bold"
              size="md"
              style={{ color: textPrimary, marginLeft: 8 }}
            >
              Basic Information
            </StandardText>
          </View>
          <Gap size="md" />

          <StyledTextInput
            label="Expense Title *"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., AC Maintenance"
            maxLength={100}
          />
          <Gap size="sm" />

          <StyledTextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Enter expense details"
            multiline
            numberOfLines={3}
            maxLength={500}
          />
          <Gap size="sm" />

          <StyledTextInput
            label="Amount *"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            leftIcon="currency-inr"
          />
        </StandardCard>

        <Gap size="md" />

        {/* Vendor Information */}
        <StandardCard
          style={[styles.card, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="store"
              size={20}
              color={colors.primary}
            />
            <StandardText
              fontWeight="bold"
              size="md"
              style={{ color: textPrimary, marginLeft: 8 }}
            >
              Vendor Details
            </StandardText>
          </View>
          <Gap size="md" />

          <StyledTextInput
            label="Vendor Name"
            value={vendorName}
            onChangeText={setVendorName}
            placeholder="Vendor or service provider name"
            maxLength={100}
          />
          <Gap size="sm" />

          <StyledTextInput
            label="Vendor Contact"
            value={vendorContact}
            onChangeText={setVendorContact}
            placeholder="+91 XXXXX XXXXX"
            keyboardType="phone-pad"
            maxLength={20}
          />
          <Gap size="sm" />

          <StyledTextInput
            label="Invoice Number"
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
            placeholder="INV-2025-001"
            maxLength={50}
          />
        </StandardCard>

        <Gap size="md" />

        {/* Dates */}
        <StandardCard
          style={[styles.card, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={colors.primary}
            />
            <StandardText
              fontWeight="bold"
              size="md"
              style={{ color: textPrimary, marginLeft: 8 }}
            >
              Dates
            </StandardText>
          </View>
          <Gap size="md" />

          <TouchableOpacity
            style={[styles.dateField, { borderColor: colors.primary }]}
            onPress={() => setShowExpenseDatePicker(true)}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={colors.primary}
            />
            <View style={styles.dateTextContainer}>
              <StandardText size="xs" style={{ color: textSecondary }}>
                Expense Date *
              </StandardText>
              <StandardText
                fontWeight="medium"
                size="md"
                style={{ color: textPrimary }}
              >
                {expenseDate
                  ? new Date(expenseDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Select date'}
              </StandardText>
            </View>
          </TouchableOpacity>

          <Gap size="sm" />

          <TouchableOpacity
            style={[styles.dateField, { borderColor: colors.error }]}
            onPress={() => setShowDueDatePicker(true)}
          >
            <MaterialCommunityIcons
              name="calendar-alert"
              size={20}
              color={colors.error}
            />
            <View style={styles.dateTextContainer}>
              <StandardText size="xs" style={{ color: textSecondary }}>
                Due Date *
              </StandardText>
              <StandardText
                fontWeight="medium"
                size="md"
                style={{ color: textPrimary }}
              >
                {dueDate
                  ? new Date(dueDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Select date'}
              </StandardText>
            </View>
          </TouchableOpacity>
        </StandardCard>

        <Gap size="md" />

        {/* Priority */}
        <StandardCard
          style={[styles.card, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="flag"
              size={20}
              color={colors.primary}
            />
            <StandardText
              fontWeight="bold"
              size="md"
              style={{ color: textPrimary, marginLeft: 8 }}
            >
              Priority Level
            </StandardText>
          </View>
          <Gap size="sm" />
          <View style={styles.chipContainer}>
            {priorityOptions.map(option => (
              <Chip
                key={option.key}
                selected={priority === option.key}
                onPress={() => setPriority(option.key)}
                style={[
                  styles.chip,
                  priority === option.key && {
                    backgroundColor: option.color + '20',
                  },
                ]}
                textStyle={{
                  color: priority === option.key ? option.color : textPrimary,
                }}
              >
                {option.label}
              </Chip>
            ))}
          </View>
        </StandardCard>

        <Gap size="md" />

        {/* Status */}
        <StandardCard
          style={[styles.card, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="progress-check"
              size={20}
              color={colors.primary}
            />
            <StandardText
              fontWeight="bold"
              size="md"
              style={{ color: textPrimary, marginLeft: 8 }}
            >
              Status
            </StandardText>
          </View>
          <Gap size="sm" />
          <View style={styles.chipContainer}>
            {statusOptions.map(option => (
              <Chip
                key={option.key}
                selected={status === option.key}
                onPress={() => setStatus(option.key)}
                style={[
                  styles.chip,
                  status === option.key && {
                    backgroundColor: option.color + '20',
                  },
                ]}
                textStyle={{
                  color: status === option.key ? option.color : textPrimary,
                }}
              >
                {option.label}
              </Chip>
            ))}
          </View>
        </StandardCard>

        <Gap size="md" />

        {/* Notes */}
        <StandardCard
          style={[styles.card, { backgroundColor: cardBackground }]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="note-text"
              size={20}
              color={colors.primary}
            />
            <StandardText
              fontWeight="bold"
              size="md"
              style={{ color: textPrimary, marginLeft: 8 }}
            >
              Additional Notes
            </StandardText>
          </View>
          <Gap size="md" />

          <StyledTextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional information..."
            multiline
            numberOfLines={4}
            maxLength={1000}
          />
        </StandardCard>

        <Gap size="lg" />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={[styles.button, { borderColor: colors.error }]}
            labelStyle={{ color: colors.error }}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={[styles.button, { backgroundColor: colors.success }]}
            labelStyle={{ color: colors.white }}
          >
            {expenseToEdit ? 'Update' : 'Create'}
          </Button>
        </View>

        <Gap size="xxl" />
      </ScrollView>

      {/* Date Pickers */}
      <BeautifulDatePicker
        visible={showExpenseDatePicker}
        onDismiss={() => setShowExpenseDatePicker(false)}
        onDateSelect={date => {
          setExpenseDate(date.toISOString().split('T')[0]);
        }}
        title="Select Expense Date"
        initialDate={expenseDate}
      />

      <BeautifulDatePicker
        visible={showDueDatePicker}
        onDismiss={() => setShowDueDatePicker(false)}
        onDateSelect={date => {
          setDueDate(date.toISOString().split('T')[0]);
        }}
        title="Select Due Date"
        initialDate={dueDate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    padding: 20,
    borderRadius: RADIUS.medium,
    ...SHADOW.medium,
    shadowColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: RADIUS.small,
    borderWidth: 1,
    gap: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f5f5f5',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
  },
});

export default AddExpense;
