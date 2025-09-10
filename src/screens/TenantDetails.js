import React, { useContext, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Button, Chip, Card, Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import Gap from '../components/Gap/Gap';
import StandardInformationAccordion from '../components/StandardInformationAccordion/StandardInformationAccordion';
import colors from '../theme/color';
import { deleteTenant, putTenantOnNotice } from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const TenantDetails = ({ navigation, route }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);
  const { tenant } = route.params;

  const [activeMenu, setActiveMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState(null);
  const anchorRef = useRef(null);

  // Theme variables
  const isDark = mode === 'dark';
  const backgroundColor = isDark
    ? colors.backgroundDark
    : colors.backgroundLight;
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />

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
              <MaterialCommunityIcons
                name="account-circle"
                size={80}
                color={colors.primary}
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
                    size={24}
                    color={textSecondary}
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
                      : colors.success + '20',
                  },
                ]}
                textStyle={[
                  styles.statusText,
                  {
                    color: tenant.is_on_notice
                      ? colors.warning
                      : colors.success,
                  },
                ]}
              >
                {tenant.is_on_notice ? 'On Notice' : 'Active'}
              </Chip>
            </View>
          </View>

          {/* Divider */}
          <Divider style={styles.profileDivider} />

          {/* Contact Info */}
          <View style={styles.contactSection}>
            <DetailRow
              icon="phone"
              label="Mobile"
              value={tenant.phone_number}
              isDark={isDark}
            />
            <DetailRow
              icon="email"
              label="Email"
              value={tenant.email || 'N/A'}
              isDark={isDark}
            />
            <DetailRow
              icon="calendar"
              label="Joined"
              value={tenant.check_in_date}
              isDark={isDark}
            />
          </View>
        </Card>

        <Gap size="lg" />

        {/* Information Sections */}
        <View style={styles.sectionsContainer}>
          {/* Room & Rent Details */}
          <StandardInformationAccordion
            icon={'home'}
            heading="Room & Rent Details"
            content={
              <View style={styles.accordionContent}>
                <DetailRow
                  label="Room"
                  value={tenant.room?.name}
                  isDark={isDark}
                />
                <DetailRow
                  label="Rent Amount"
                  value={`₹${tenant.rent_amount}`}
                  isDark={isDark}
                />
                <DetailRow
                  label="Deposit"
                  value={`₹${tenant.room?.securityAmount || 'N/A'}`}
                  isDark={isDark}
                />
                <DetailRow
                  label="Rent Due"
                  value={tenant.rent_due_date || 'No Dues'}
                  isDark={isDark}
                />
                <DetailRow
                  label="Lease End"
                  value={tenant.check_out_date || 'N/A'}
                  isDark={isDark}
                />
              </View>
            }
          />

          <Gap size="md" />

          {/* Family & Emergency */}
          <StandardInformationAccordion
            icon={'account-group'}
            heading="Family & Emergency Contacts"
            content={
              <View style={styles.accordionContent}>
                {tenant.emergency_contact && (
                  <DetailRow
                    label="Emergency Contact"
                    value={`${tenant.emergency_contact.name} (${tenant.emergency_contact.phone})`}
                    isDark={isDark}
                  />
                )}
                {tenant.guardian && (
                  <DetailRow
                    label="Guardian"
                    value={`${tenant.guardian.name} (${tenant.guardian.phone})`}
                    isDark={isDark}
                  />
                )}
                {!tenant.emergency_contact && !tenant.guardian && (
                  <StandardText style={{ color: textSecondary }}>
                    No emergency contacts added
                  </StandardText>
                )}
              </View>
            }
          />

          <Gap size="md" />

          {/* Payment History */}
          <StandardInformationAccordion
            icon={'credit-card'}
            heading="Payment History"
            content={
              <View style={styles.accordionContent}>
                {tenant.payments && tenant.payments.length > 0 ? (
                  tenant.payments
                    .slice(0, 3)
                    .map((p, idx) => (
                      <DetailRow
                        key={idx}
                        label={`${p.date}`}
                        value={`₹${p.amount} (${p.status})`}
                        isDark={isDark}
                      />
                    ))
                ) : (
                  <StandardText style={{ color: textSecondary }}>
                    No payments recorded
                  </StandardText>
                )}
              </View>
            }
          />

          <Gap size="md" />

          {/* KYC Documents */}
          <Card style={[styles.kycCard, { backgroundColor: cardBackground }]}>
            <View style={styles.kycHeader}>
              <View style={styles.kycTitleRow}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={24}
                  color={colors.primary}
                  style={styles.kycIcon}
                />
                <StandardText
                  fontWeight="bold"
                  style={[styles.kycTitle, { color: textPrimary }]}
                >
                  KYC Documents
                </StandardText>
              </View>
              <Chip
                style={[
                  styles.verificationChip,
                  {
                    backgroundColor: tenant.kyc_verified
                      ? colors.success + '20'
                      : colors.warning + '20',
                  },
                ]}
                textStyle={[
                  styles.verificationText,
                  {
                    color: tenant.kyc_verified
                      ? colors.success
                      : colors.warning,
                  },
                ]}
              >
                {tenant.kyc_verified ? 'Verified' : 'Pending'}
              </Chip>
            </View>

            <View style={styles.documentsGrid}>
              {tenant.kyc_docs && tenant.kyc_docs.length > 0 ? (
                tenant.kyc_docs.map((doc, idx) => (
                  <View key={idx} style={styles.documentCard}>
                    <Image
                      source={{ uri: doc.url }}
                      style={styles.documentImage}
                      resizeMode="cover"
                    />
                    <View style={styles.documentInfo}>
                      <StandardText
                        style={[styles.documentType, { color: textPrimary }]}
                        fontWeight="medium"
                      >
                        {doc.type}
                      </StandardText>
                    </View>
                  </View>
                ))
              ) : (
                <StandardText style={{ color: textSecondary }}>
                  No documents uploaded
                </StandardText>
              )}
            </View>
          </Card>

          <Gap size="lg" />

          {/* Action Buttons */}
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
                navigation.navigate('EditTenant', { tenantId: tenant.id })
              }
            >
              Edit Details
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
                navigation.navigate('RecordPayment', { tenant: tenant })
              }
            >
              Record Payment
            </Button>
          </View>

          <Gap size="xxl" />
        </View>
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
                navigation.navigate('EditTenant', { tenantId: tenant.id });
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

            <TouchableOpacity style={styles.menuItem} onPress={() => {}}>
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
                await putTenantOnNotice(credentials.accessToken, tenant.id, {
                  notice: true,
                });
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
                await deleteTenant(credentials.accessToken, tenant.id);
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
    </SafeAreaView>
  );
};

// Small reusable row component
const DetailRow = ({ icon, label, value, isMultiline, isDark }) => (
  <View
    style={[
      styles.detailRow,
      isMultiline && { flexDirection: 'column', alignItems: 'flex-start' },
    ]}
  >
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
        {
          marginLeft: isMultiline ? 0 : 8,
          color: isDark ? colors.white : colors.textPrimary,
        },
      ]}
    >
      {value}
    </StandardText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginTop: -20,
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
  verificationChip: {
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
});

export default TenantDetails;
