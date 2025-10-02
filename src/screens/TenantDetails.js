import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { Button, Chip, Card, Divider, Checkbox } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import Gap from '../components/Gap/Gap';
import colors from '../theme/color';
import {
  deleteTenant,
  putTenantOnNotice,
  getTenant,
  getKYCByTenantId,
  createDocument,
  updateKYC,
  uploadToS3,
} from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';
import { PropertyContext } from '../context/PropertyContext';
import Share from 'react-native-share';
import { pick } from '@react-native-documents/picker';

const screenWidth = Dimensions.get('window').width;

// Helper function to calculate staying duration
const calculateStayingDuration = checkInDate => {
  if (!checkInDate) return 'N/A';

  const checkIn = new Date(checkInDate);
  const now = new Date();

  const diffTime = Math.abs(now - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    return remainingDays > 0
      ? `${months} months & ${remainingDays} days`
      : `${months} months`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    return remainingMonths > 0
      ? `${years} years & ${remainingMonths} months`
      : `${years} years`;
  }
};

const TenantDetails = ({ navigation, route }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);
  const { selectedProperty } = useContext(PropertyContext);

  const { tenant_id } = route.params;

  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeMenu, setActiveMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const anchorRef = useRef(null);

  // Modal states
  const [ledgerModalVisible, setLedgerModalVisible] = useState(false);
  const [ledgerType, setLedgerType] = useState(''); // 'dues', 'collection', 'deposit'
  const [
    backgroundVerificationModalVisible,
    setBackgroundVerificationModalVisible,
  ] = useState(false);
  const [verificationDocument, setVerificationDocument] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);

  // Theme variables
  const isDark = mode === 'dark';
  const backgroundColor = isDark
    ? colors.backgroundDark
    : colors.backgroundLight;
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Fetch tenant details if tenantId is provided but no tenant data
  useEffect(() => {
    const fetchTenantDetails = async () => {
      if (!tenant_id || tenant) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getTenant(
          credentials?.token || credentials?.accessToken,
          tenant_id,
        );

        if (response.success && response.data) {
          setTenant(response.data);
        } else {
          const errorMessage =
            response.error || 'Failed to fetch tenant details';
          setError(errorMessage);
        }
      } catch (err) {
        const errorMessage =
          'Network error. Please check your connection and try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchTenantDetails();
  }, [tenant_id, credentials, navigation, tenant]);

  const openMenu = () => {
    if (!anchorRef.current || !anchorRef.current.measureInWindow) {
      setMenuPosition({ x: screenWidth / 2 - 80, y: 200, width: 0, height: 0 });
      setActiveMenu(true);
      return;
    }
    anchorRef.current.measureInWindow((x, y, width, height) => {
      setMenuPosition({ x, y, width, height });
      setActiveMenu(true);
    });
  };

  const closeMenu = () => {
    setActiveMenu(false);
    setMenuPosition(null);
  };

  const handleShareTenant = async tenantData => {
    try {
      const message =
        `👤 Tenant Details\n` +
        `Name: ${tenantData.name || 'N/A'}\n` +
        `Phone: ${tenantData.phone_number || 'N/A'}\n` +
        (tenantData.alternate_phone
          ? `Alternate Phone: ${tenantData.alternate_phone}\n`
          : '') +
        `Email: ${tenantData.email || 'N/A'}\n` +
        `Room: ${tenantData?.room?.name || 'No room assigned'}\n` +
        `Rent: ₹${tenantData.rent_amount || 'N/A'}\n` +
        `Check-in Date: ${
          tenantData.check_in_date
            ? new Date(tenantData.check_in_date).toLocaleDateString()
            : 'N/A'
        }\n` +
        `Check-out Date: ${
          tenantData.check_out_date
            ? new Date(tenantData.check_out_date).toLocaleDateString()
            : 'N/A'
        }\n` +
        (tenantData.lock_in_period
          ? `Lock-in Period: ${tenantData.lock_in_period} months\n`
          : '') +
        (tenantData.agreement_period
          ? `Agreement Period: ${tenantData.agreement_period} months\n`
          : '') +
        (tenantData.tenant_type
          ? `Tenant Type: ${tenantData.tenant_type}\n`
          : '') +
        (tenantData.has_dues ? `⚠️ Has outstanding dues\n` : '✅ No dues\n') +
        (tenantData.is_on_notice ? `⚠️ On notice period\n` : '');

      await Share.open({
        title: 'Share Tenant Details',
        message,
      });
    } catch (err) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', err);
    }
  };

  // Modal functions
  const openLedgerModal = type => {
    setLedgerType(type);
    setLedgerModalVisible(true);
  };

  const closeLedgerModal = () => {
    setLedgerModalVisible(false);
    setLedgerType('');
  };

  const openBackgroundVerificationModal = () => {
    setBackgroundVerificationModalVisible(true);
  };

  const closeBackgroundVerificationModal = () => {
    setBackgroundVerificationModalVisible(false);
    setVerificationDocument(null);
    setConsentChecked(false);
  };

  const handleDocumentPicker = async () => {
    try {
      const results = await pick({
        type: ['*/*'],
      });
      // Since pick returns an array, take the first result
      const res = results[0];
      setVerificationDocument({
        uri: res.uri,
        type: res.type,
        name: res.name,
      });
    } catch (err) {
      if (err.code === 'DOCUMENT_PICKER_CANCELED') {
        // User cancelled the picker
      } else {
        Alert.alert('Error', 'Failed to pick document. Please try again.');
      }
    }
  };

  const handleBackgroundVerification = async () => {
    if (!verificationDocument || !consentChecked) {
      Alert.alert(
        'Error',
        'Please upload a document and provide consent to proceed.',
      );
      return;
    }

    try {
      setVerificationLoading(true);

      // Get the KYC data for the tenant
      const kycResponse = await getKYCByTenantId(
        credentials.accessToken,
        tenant.tenant_id,
      );

      if (!kycResponse.success || !kycResponse.data) {
        Alert.alert(
          'Error',
          'KYC data not found for this tenant. Please ensure KYC is set up first.',
        );
        return;
      }

      const kyc_id = kycResponse.data.items[0].kyc_id;

      if (!verificationDocument) {
        Alert.alert('Error', 'Please select a document to upload.');
        return;
      }

      // Create the document record
      const documentData = {
        file_name:
          verificationDocument.name ||
          verificationDocument.uri.split('/').pop() ||
          'kyc_document',
        file_type: verificationDocument.type || 'application/pdf',
        descriptor: 'KYC Verification Document',
        is_signature_required: false,
        doc_type: 'kyc_verification',
      };

      const createResponse = await createDocument(
        credentials.accessToken,
        tenant?.property_id,
        documentData,
      );

      if (!createResponse.success) {
        Alert.alert(
          'Error',
          createResponse.error ||
            'Failed to create document record. Please try again.',
        );
        return;
      }

      await uploadToS3(createResponse.data.upload_url, verificationDocument);

      const documentUrl = createResponse.data?.document_id;

      // Update KYC with verification details
      const updateData = {
        status: 'verified',
        verificationNotes: 'Background verification completed',
        documentUrl,
      };

      const updateResponse = await updateKYC(
        credentials.accessToken,
        kyc_id,
        updateData,
      );

      if (updateResponse.success) {
        closeBackgroundVerificationModal();
      } else {
        Alert.alert(
          'Error',
          updateResponse.error || 'Failed to update KYC. Please try again.',
        );
      }
    } catch (verificationError) {
      Alert.alert(
        'Error',
        'Failed to submit background verification request. Please try again.',
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  // Ledger data from real tenant data
  const getLedgerData = type => {
    switch (type) {
      case 'dues':
        return tenant.invoices
          ? tenant.invoices
              .filter(inv => parseFloat(inv.outstanding_amount) > 0)
              .map((inv, index) => ({
                id: inv.invoice_id,
                date: new Date(inv.issue_date).toLocaleDateString(),
                description: inv.description || 'Invoice',
                amount: parseFloat(inv.outstanding_amount),
                type: 'debit',
                status: inv.status === 'PAID' ? 'paid' : 'pending',
              }))
          : [];
      case 'collection':
        // Use payments if available, else use paid amounts from invoices
        if (tenant.payments && tenant.payments.length > 0) {
          return tenant.payments.map((payment, index) => ({
            id: payment.payment_id,
            date: new Date(payment.paymentDate).toLocaleDateString(),
            description: payment.notes || 'Payment',
            amount: parseFloat(payment.amount),
            type: 'credit',
            status: 'received',
          }));
        } else {
          return tenant.invoices
            ? tenant.invoices
                .filter(inv => parseFloat(inv.paid_amount) > 0)
                .map((inv, index) => ({
                  id: inv.invoice_id,
                  date: new Date(inv.issue_date).toLocaleDateString(),
                  description: inv.description || 'Invoice Payment',
                  amount: parseFloat(inv.paid_amount),
                  type: 'credit',
                  status: 'received',
                }))
            : [];
        }
      case 'deposit':
        return tenant.rentals && tenant.rentals.length > 0
          ? [
              {
                id: tenant.rentals[0].rental_id,
                date: new Date(
                  tenant.rentals[0].startDate,
                ).toLocaleDateString(),
                description: 'Security Deposit',
                amount: parseFloat(tenant.rentals[0].securityDeposit || 0),
                type: 'credit',
                status: tenant.rentals[0].isSecurityDepositPaid
                  ? 'received'
                  : 'pending',
              },
            ]
          : [];
      default:
        return [];
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <StandardHeader navigation={navigation} title="Tenant Details" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <StandardText style={[styles.loadingText, { color: textSecondary }]}>
            Loading tenant details...
          </StandardText>
        </View>
      </View>
    );
  }

  // Error state
  if (error || !tenant) {
    return (
      <View style={[styles.container]}>
        <StandardHeader navigation={navigation} title="Tenant Details" />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={80}
            color={colors.error}
          />
          <StandardText style={[styles.errorTitle, { color: textPrimary }]}>
            Unable to Load Tenant
          </StandardText>
          <StandardText style={[styles.errorMessage, { color: textSecondary }]}>
            {error || 'Tenant data not found'}
          </StandardText>
          <Button
            mode="contained"
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            labelStyle={{ color: colors.white }}
            onPress={() => navigation.goBack()}
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StandardHeader navigation={navigation} title="Tenant Details" />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Profile Card */}
        <Card style={[styles.profileCard, { backgroundColor: cardBackground }]}>
          {/* Header Row: Avatar + Name + Menu */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {tenant.profileImage ? (
                <Image
                  source={{ uri: tenant.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.defaultAvatar}>
                  <MaterialCommunityIcons
                    name="account"
                    size={40}
                    color={colors.white}
                  />
                </View>
              )}
              {/* Status indicator */}
              <View
                style={[
                  styles.statusIndicator,
                  {
                    backgroundColor: tenant.is_on_notice
                      ? colors.warning
                      : tenant.is_active !== false
                      ? colors.success
                      : colors.error,
                  },
                ]}
              />
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <StandardText
                  fontWeight="bold"
                  style={[styles.tenantName, { color: textPrimary }]}
                >
                  {tenant.name}
                </StandardText>

                {/* Custom Menu Anchor */}
                <TouchableOpacity
                  ref={anchorRef}
                  onPress={openMenu}
                  style={styles.menuButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <MaterialCommunityIcons
                    name="dots-vertical"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Status Chip */}
              <Chip
                style={[
                  styles.statusChip,
                  {
                    backgroundColor: tenant.is_on_notice
                      ? colors.warning + '20'
                      : tenant.is_active !== false
                      ? colors.success + '20'
                      : colors.error + '20',
                  },
                ]}
                textStyle={[
                  styles.statusText,
                  {
                    color: tenant.is_on_notice
                      ? colors.warning
                      : tenant.is_active !== false
                      ? colors.success
                      : colors.error,
                  },
                ]}
              >
                {tenant.is_on_notice
                  ? 'On Notice'
                  : tenant.is_active !== false
                  ? 'Active'
                  : 'Inactive'}
              </Chip>
            </View>
          </View>

          {/* Divider */}
          <Divider style={styles.profileDivider} />

          {/* Tenant Details Grid */}
          <View style={styles.detailsGrid}>
            <DetailRow
              label="Room"
              value={tenant.room?.name || 'Not assigned'}
              isDark={isDark}
            />
            <DetailRow
              label="Date of Joining"
              value={
                tenant.check_in_date
                  ? new Date(tenant.check_in_date).toLocaleDateString()
                  : 'N/A'
              }
              isDark={isDark}
            />
            <DetailRow
              label="Move Out Date"
              value={
                tenant.check_out_date
                  ? new Date(tenant.check_out_date).toLocaleDateString()
                  : 'N/A'
              }
              isDark={isDark}
            />
            <DetailRow
              label="Staying Since"
              value={
                tenant.check_in_date
                  ? calculateStayingDuration(tenant.check_in_date)
                  : 'N/A'
              }
              isDark={isDark}
            />
            <DetailRow
              label="Rent Amount"
              value={`₹${parseFloat(tenant.rent_amount || 0).toLocaleString()}`}
              isDark={isDark}
            />
            <DetailRow
              label="Add Rent On"
              value={
                tenant.add_rent_on
                  ? new Date(tenant.add_rent_on).toLocaleDateString()
                  : 'N/A'
              }
              isDark={isDark}
            />
            <DetailRow
              label="Agreement Period"
              value={
                tenant.agreement_period
                  ? `${tenant.agreement_period} months`
                  : 'N/A'
              }
              isDark={isDark}
            />
            <DetailRow
              label="Lock-in Period"
              value={
                tenant.lock_in_period
                  ? `${tenant.lock_in_period} months`
                  : 'N/A'
              }
              isDark={isDark}
            />
            <DetailRow
              label="Tenant Type"
              value={tenant.tenant_type || 'N/A'}
              isDark={isDark}
            />
            <DetailRow
              label="Phone"
              value={tenant.phone_number || 'N/A'}
              isDark={isDark}
            />
            <DetailRow
              label="Alternate Phone"
              value={tenant.alternate_phone || 'N/A'}
              isDark={isDark}
            />
            <DetailRow
              label="Email"
              value={tenant.email || 'N/A'}
              isDark={isDark}
            />
          </View>
        </Card>

        <Gap size="lg" />

        {/* Financial Summary Card */}
        <Card style={[styles.profileCard, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <StandardText
              fontWeight="bold"
              style={[styles.sectionTitle, { color: textPrimary }]}
            >
              Financial Summary
            </StandardText>
          </View>

          <View style={styles.financialGrid}>
            <View style={styles.financialItem}>
              <StandardText
                style={[styles.financialLabel, { color: textSecondary }]}
              >
                Total Dues
              </StandardText>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => openLedgerModal('dues')}
              >
                <StandardText style={styles.viewButtonText}>View</StandardText>
              </TouchableOpacity>
              <StandardText
                style={[styles.financialAmount, { color: colors.error }]}
              >
                ₹
                {tenant.invoices
                  ? tenant.invoices
                      .reduce(
                        (sum, inv) =>
                          sum + parseFloat(inv.outstanding_amount || 0),
                        0,
                      )
                      .toLocaleString()
                  : '0'}
              </StandardText>
            </View>

            <View style={styles.financialItem}>
              <StandardText
                style={[styles.financialLabel, { color: textSecondary }]}
              >
                Total Collection
              </StandardText>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => openLedgerModal('collection')}
              >
                <StandardText style={styles.viewButtonText}>View</StandardText>
              </TouchableOpacity>
              <StandardText
                style={[styles.financialAmount, { color: colors.success }]}
              >
                ₹
                {tenant.invoices
                  ? tenant.invoices
                      .reduce(
                        (sum, inv) => sum + parseFloat(inv.paid_amount || 0),
                        0,
                      )
                      .toLocaleString()
                  : '0'}
              </StandardText>
            </View>

            <View style={styles.financialItem}>
              <StandardText
                style={[styles.financialLabel, { color: textSecondary }]}
              >
                Total Deposit
              </StandardText>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => openLedgerModal('deposit')}
              >
                <StandardText style={styles.viewButtonText}>View</StandardText>
              </TouchableOpacity>
              <StandardText
                style={[styles.financialAmount, { color: textPrimary }]}
              >
                ₹
                {tenant.rentals && tenant.rentals.length > 0
                  ? parseFloat(
                      tenant.rentals[0].securityDeposit || 0,
                    ).toLocaleString()
                  : '0'}
              </StandardText>
            </View>
          </View>
        </Card>

        <Gap size="lg" />

        {/* Verification Status Card */}
        <Card style={[styles.profileCard, { backgroundColor: cardBackground }]}>
          <View style={styles.verificationGrid}>
            <View style={styles.verificationRow}>
              <StandardText
                style={[styles.verificationLabel, { color: textSecondary }]}
              >
                Web Check-in:
              </StandardText>
              <TouchableOpacity
                style={[styles.checkInButton, { borderColor: colors.primary }]}
              >
                <StandardText
                  style={[styles.checkInButtonText, { color: colors.primary }]}
                >
                  Check-in
                </StandardText>
                <MaterialCommunityIcons
                  name="link"
                  size={16}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.verificationRow}>
              <StandardText
                style={[styles.verificationLabel, { color: textSecondary }]}
              >
                Renting Terms:
              </StandardText>
              <Chip
                style={[
                  styles.verificationChip,
                  { backgroundColor: colors.success + '20' },
                ]}
                textStyle={[
                  styles.verificationChipText,
                  { color: colors.success },
                ]}
              >
                Approved
              </Chip>
            </View>

            <View style={styles.verificationRow}>
              <StandardText
                style={[styles.verificationLabel, { color: textSecondary }]}
              >
                ID Verification:
              </StandardText>
              <Chip
                style={[
                  styles.verificationChip,
                  {
                    backgroundColor:
                      tenant.kycDocuments &&
                      tenant.kycDocuments.length > 0 &&
                      tenant.kycDocuments[0].status === 'verified'
                        ? colors.success + '20'
                        : colors.warning + '20',
                  },
                ]}
                textStyle={[
                  styles.verificationChipText,
                  {
                    color:
                      tenant.kycDocuments &&
                      tenant.kycDocuments.length > 0 &&
                      tenant.kycDocuments[0].status === 'verified'
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              >
                {tenant.kycDocuments &&
                tenant.kycDocuments.length > 0 &&
                tenant.kycDocuments[0].status === 'verified'
                  ? 'Verified'
                  : tenant.kycDocuments && tenant.kycDocuments.length > 0
                  ? tenant.kycDocuments[0].status || 'Pending'
                  : 'Not Submitted'}
              </Chip>
            </View>

            <View style={styles.verificationRow}>
              <StandardText
                style={[styles.verificationLabel, { color: textSecondary }]}
              >
                Rental Agreement:
              </StandardText>
              <Chip
                style={[
                  styles.verificationChip,
                  {
                    backgroundColor:
                      tenant.rentals &&
                      tenant.rentals.length > 0 &&
                      tenant.rentals[0].isActive
                        ? colors.success + '20'
                        : colors.warning + '20',
                  },
                ]}
                textStyle={[
                  styles.verificationChipText,
                  {
                    color:
                      tenant.rentals &&
                      tenant.rentals.length > 0 &&
                      tenant.rentals[0].isActive
                        ? colors.success
                        : colors.warning,
                  },
                ]}
              >
                {tenant.rentals &&
                tenant.rentals.length > 0 &&
                tenant.rentals[0].isActive
                  ? 'Active'
                  : tenant.rentals && tenant.rentals.length > 0
                  ? 'Inactive'
                  : 'Not Created'}
              </Chip>
            </View>

            <View style={styles.verificationRow}>
              <StandardText
                style={[styles.verificationLabel, { color: textSecondary }]}
              >
                Background Verification
              </StandardText>
              <TouchableOpacity
                style={styles.verifyButton}
                onPress={openBackgroundVerificationModal}
              >
                <StandardText
                  style={[styles.verifyButtonText, { color: colors.primary }]}
                >
                  Verify
                </StandardText>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        <View style={styles.actionButtonsContainer}>
          <Button
            mode="outlined"
            style={[
              styles.actionButton,
              styles.editButton,
              { borderColor: colors.primary },
            ]}
            labelStyle={[styles.buttonLabel, { color: colors.primary }]}
            onPress={() =>
              navigation.navigate('AddInvoice', { tenant_id: tenant.tenant_id })
            }
          >
            Add Invoice
          </Button>
          <Button
            mode="contained"
            style={[
              styles.actionButton,
              styles.paymentButton,
              { backgroundColor: colors.primary },
            ]}
            labelStyle={[styles.buttonLabel, { color: colors.white }]}
            onPress={() =>
              navigation.navigate('RecordPayment', {
                tenant_id: tenant.tenant_id,
              })
            }
          >
            Record Payment
          </Button>
        </View>

        <Gap size="xxl" />
      </ScrollView>

      {/* CUSTOM MENU OVERLAY */}
      {activeMenu && menuPosition && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={closeMenu}
        >
          <View
            style={[
              styles.popup,
              {
                top: menuPosition.y + menuPosition.height + 6,
                left: Math.max(8, Math.min(menuPosition.x, screenWidth - 180)),
                backgroundColor: cardBackground,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                navigation.navigate('AddTenant', {
                  tenant: tenant,
                  isEdit: true,
                });
              }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={20}
                color={colors.primary}
                style={styles.menuIcon}
              />
              <StandardText style={{ color: textPrimary }}>Edit</StandardText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                handleShareTenant(tenant);
              }}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={20}
                color={colors.primary}
                style={styles.menuIcon}
              />
              <StandardText style={{ color: textPrimary }}>Share</StandardText>
            </TouchableOpacity>

            <Divider style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                await putTenantOnNotice(
                  credentials.accessToken,
                  tenant.tenant_id,
                  {
                    notice: true,
                  },
                );
                closeMenu();
              }}
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={20}
                color={colors.warning}
                style={styles.menuIcon}
              />
              <StandardText style={{ color: colors.warning }}>
                Put on Notice
              </StandardText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                await deleteTenant(credentials.accessToken, tenant.tenant_id);
                closeMenu();
                navigation.goBack();
              }}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={20}
                color={colors.error}
                style={styles.menuIcon}
              />
              <StandardText style={{ color: colors.error }}>
                Delete
              </StandardText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* Ledger Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={ledgerModalVisible}
        onRequestClose={closeLedgerModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: cardBackground }]}
          >
            <View style={styles.modalHeader}>
              <StandardText
                fontWeight="bold"
                style={[styles.modalTitle, { color: textPrimary }]}
              >
                {ledgerType === 'dues' && 'Outstanding Dues'}
                {ledgerType === 'collection' && 'Payment Collection'}
                {ledgerType === 'deposit' && 'Security Deposit'}
              </StandardText>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeLedgerModal}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={textSecondary}
                />
              </TouchableOpacity>
            </View>

            <FlatList
              data={getLedgerData(ledgerType)}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.ledgerItem,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  <View style={styles.ledgerLeft}>
                    <StandardText
                      fontWeight="600"
                      style={[styles.ledgerDescription, { color: textPrimary }]}
                    >
                      {item.description}
                    </StandardText>
                    <StandardText
                      style={[styles.ledgerDate, { color: textSecondary }]}
                    >
                      {item.date}
                    </StandardText>
                  </View>
                  <View style={styles.ledgerRight}>
                    <StandardText
                      fontWeight="bold"
                      style={[
                        styles.ledgerAmount,
                        {
                          color:
                            item.type === 'debit'
                              ? item.status === 'pending'
                                ? colors.error
                                : colors.warning
                              : colors.success,
                        },
                      ]}
                    >
                      {item.type === 'debit' ? '-' : '+'}₹
                      {item.amount.toLocaleString()}
                    </StandardText>
                    <Chip
                      style={[
                        styles.ledgerStatusChip,
                        {
                          backgroundColor:
                            item.status === 'paid' || item.status === 'received'
                              ? colors.success + '20'
                              : colors.warning + '20',
                        },
                      ]}
                      textStyle={[
                        styles.chipText,
                        {
                          color:
                            item.status === 'paid' || item.status === 'received'
                              ? colors.success
                              : colors.warning,
                        },
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Chip>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Background Verification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={backgroundVerificationModalVisible}
        onRequestClose={closeBackgroundVerificationModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContainer, { backgroundColor: cardBackground }]}
          >
            <View style={styles.modalHeader}>
              <StandardText
                fontWeight="bold"
                style={[styles.modalTitle, { color: textPrimary }]}
              >
                Background Verification
              </StandardText>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeBackgroundVerificationModal}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <StandardText
                style={[
                  styles.verificationDescription,
                  { color: textSecondary },
                ]}
              >
                Upload a government-issued ID or background check document to
                verify the tenant's background.
              </StandardText>

              <Gap size="lg" />

              {/* Document Upload Section */}
              <View style={styles.uploadSection}>
                <StandardText
                  fontWeight="600"
                  style={[styles.uploadTitle, { color: textPrimary }]}
                >
                  Upload Document
                </StandardText>

                <TouchableOpacity
                  style={[styles.uploadButton, { borderColor: colors.primary }]}
                  onPress={handleDocumentPicker}
                >
                  <MaterialCommunityIcons
                    name="cloud-upload"
                    size={32}
                    color={colors.primary}
                  />
                  <StandardText
                    style={[styles.uploadButtonText, { color: colors.primary }]}
                  >
                    {verificationDocument
                      ? 'Document Selected'
                      : 'Select Document'}
                  </StandardText>
                  <StandardText
                    style={[styles.uploadSubtext, { color: textSecondary }]}
                  >
                    PDF, JPG, PNG files accepted
                  </StandardText>
                </TouchableOpacity>

                {verificationDocument && (
                  <View
                    style={[
                      styles.documentPreview,
                      { backgroundColor: colors.accent },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={
                        verificationDocument.type === 'pdf'
                          ? 'file-pdf-box'
                          : 'image'
                      }
                      size={24}
                      color={colors.primary}
                    />
                    <StandardText
                      style={[styles.documentName, { color: textPrimary }]}
                    >
                      {verificationDocument.name}
                    </StandardText>
                    <TouchableOpacity
                      onPress={() => setVerificationDocument(null)}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={20}
                        color={colors.error}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <Gap size="lg" />

              {/* Consent Section */}
              <View style={styles.consentSection}>
                <TouchableOpacity
                  style={styles.consentRow}
                  onPress={() => setConsentChecked(!consentChecked)}
                >
                  <Checkbox
                    status={consentChecked ? 'checked' : 'unchecked'}
                    color={colors.primary}
                  />
                  <StandardText
                    style={[styles.consentText, { color: textPrimary }]}
                  >
                    I hereby consent and approve to verify the background of
                    this tenant using the uploaded document.
                  </StandardText>
                </TouchableOpacity>
              </View>

              <Gap size="xl" />

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <Button
                  mode="outlined"
                  style={[styles.modalButton, { borderColor: colors.primary }]}
                  labelStyle={{ color: colors.primary }}
                  onPress={closeBackgroundVerificationModal}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  style={[
                    styles.modalButton,
                    { backgroundColor: colors.primary },
                  ]}
                  labelStyle={{ color: colors.white }}
                  onPress={handleBackgroundVerification}
                  loading={verificationLoading}
                  disabled={
                    !verificationDocument ||
                    !consentChecked ||
                    verificationLoading
                  }
                >
                  {verificationLoading
                    ? 'Submitting...'
                    : 'Submit Verification'}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Small reusable row component
const DetailRow = ({ icon, label, value, isMultiline, isDark }) => (
  <View style={[styles.detailRow, isMultiline && styles.detailRowMultiline]}>
    <View style={styles.detailLabelContainer}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={18}
          color={colors.primary}
          style={styles.detailIcon}
        />
      )}
      <StandardText
        fontWeight="medium"
        style={[
          styles.detailLabel,
          { color: isDark ? colors.light_gray : colors.textSecondary },
        ]}
      >
        {label}:
      </StandardText>
    </View>
    <StandardText
      style={[
        styles.detailValue,
        isMultiline ? styles.detailValueMultiline : styles.detailValueSingle,
        { color: isDark ? colors.white : colors.textPrimary },
      ]}
    >
      {value}
    </StandardText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerBanner: {
    height: 120,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    marginLeft: 16,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tenantName: {
    fontSize: 24,
    flex: 1,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
  },
  statusChip: {
    alignSelf: 'flex-start',
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  profileDivider: {
    marginVertical: 16,
  },
  contactSection: {
    gap: 8,
  },
  sectionsContainer: {
    paddingBottom: 20,
  },
  accordionContent: {
    gap: 8,
    paddingTop: 8,
  },
  kycCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  kycHeader: {
    marginBottom: 16,
  },
  kycTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  kycIcon: {
    marginRight: 8,
  },
  kycTitle: {
    fontSize: 18,
    flex: 1,
  },
  verificationChipOld: {
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
  verificationText: {
    fontWeight: '600',
    fontSize: 12,
  },
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  documentCard: {
    width: (screenWidth - 80) / 2,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  documentImage: {
    width: '100%',
    height: 120,
  },
  documentInfo: {
    padding: 12,
  },
  documentType: {
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },
  editButton: {
    borderWidth: 2,
  },
  paymentButton: {
    elevation: 2,
  },
  buttonLabel: {
    fontFamily: 'Metropolis-Bold',
    fontSize: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 32,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
  },
  detailRowMultiline: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  detailValueMultiline: {
    marginLeft: 0,
  },
  detailValueSingle: {
    marginLeft: 8,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  popup: {
    position: 'absolute',
    minWidth: 160,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    marginRight: 12,
  },
  menuDivider: {
    marginVertical: 4,
  },

  // Loading and Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    borderRadius: 12,
    paddingVertical: 4,
  },

  // Profile Image styles
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    position: 'absolute',
    bottom: 4,
    right: 4,
    borderWidth: 2,
    borderColor: colors.white,
  },

  // Details Grid
  detailsGrid: {
    gap: 12,
  },

  // Section styles
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
  },

  // Financial Summary styles
  financialGrid: {
    gap: 16,
  },
  financialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  financialLabel: {
    fontSize: 14,
    flex: 1,
  },
  financialAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  viewButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewButtonText: {
    color: colors.primary,
    fontSize: 14,
  },

  // Verification styles
  verificationGrid: {
    gap: 12,
  },
  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  verificationLabel: {
    fontSize: 14,
    flex: 1,
  },
  verificationChip: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  verificationChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  checkInButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  verifyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 0,
    elevation: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  // Ledger Modal Styles
  ledgerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  ledgerLeft: {
    flex: 1,
  },
  ledgerDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  ledgerDate: {
    fontSize: 12,
  },
  ledgerRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  ledgerAmount: {
    fontSize: 16,
    marginBottom: 10,
  },
  ledgerStatusChip: {
    height: 28,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  // Background Verification Modal Styles
  verificationDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  uploadSection: {
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 120,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
  },
  documentName: {
    flex: 1,
    fontSize: 14,
    marginLeft: 12,
  },
  consentSection: {
    width: '100%',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  consentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
});

export default TenantDetails;
