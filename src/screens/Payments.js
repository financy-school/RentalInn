import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Chip, Card, Divider } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput as PaperInput } from 'react-native-paper';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StandardCard from '../components/StandardCard/StandardCard';
import AnimatedLoader from '../components/AnimatedLoader/AnimatedLoader';
import { CredentialsContext } from '../context/CredentialsContext';
import { useProperty } from '../context/PropertyContext';
import colors from '../theme/color';
import Gap from '../components/Gap/Gap';
import { getPayments } from '../services/NetworkUtils';

const Payments = ({ navigation }) => {
  const { credentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);
  const { selectedProperty } = useProperty();

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);

  // Theme variables
  const isDark = mode === 'dark';
  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Fetch payments data
  const fetchPayments = useCallback(async () => {
    if (!credentials?.accessToken) return;

    try {
      setLoading(true);

      // Fetch payments directly
      const paymentsResponse = await getPayments(credentials.accessToken, {
        property_id: selectedProperty?.property_id || 'all',
        page: 1,
        limit: 100, // Fetch more payments for now
      });

      if (paymentsResponse.success) {
        const paymentsData = paymentsResponse.data.items || [];

        // Enrich payments with tenant names
        const enrichedPayments = paymentsData.map(payment => ({
          ...payment,
          tenant_name:
            payment.tenant?.name ||
            payment.rental?.tenant?.name ||
            'Unknown Tenant',
          tenant_id:
            payment.tenant?.tenant_id ||
            payment.rental?.tenant?.tenant_id ||
            payment.payment_tenant_id,
        }));

        // Sort payments by date (newest first)
        enrichedPayments.sort(
          (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate),
        );

        setPayments(enrichedPayments);
      } else {
        console.error('Failed to fetch payments:', paymentsResponse.error);
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [credentials, selectedProperty]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPayments();
  }, [fetchPayments]);

  // Filter payments based on search and filter
  const filteredPayments = payments.filter(payment => {
    const matchesSearch =
      search === '' ||
      payment.tenant_name?.toLowerCase().includes(search.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
      payment.notes?.toLowerCase().includes(search.toLowerCase()) ||
      payment.recordedBy?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'late' && payment.isLatePayment) ||
      (selectedFilter === 'cash' && payment.paymentMethod === 'cash') ||
      (selectedFilter === 'online' && payment.paymentMethod !== 'cash');

    return matchesSearch && matchesFilter;
  });

  // Calculate totals
  const totalReceived = payments.reduce(
    (sum, payment) => sum + parseFloat(payment.amount || 0),
    0,
  );
  const latePayments = payments.filter(p => p.isLatePayment).length;

  // Loading state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? colors.backgroundDark
              : colors.backgroundLight,
          },
        ]}
      >
        <StandardHeader navigation={navigation} title="Payments" />
        <AnimatedLoader
          message="Loading payments..."
          icon="cash-multiple"
          fullScreen={false}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <StandardHeader navigation={navigation} title="Payments" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <Card
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="cash-multiple"
                size={24}
                color={colors.success}
              />
              <StandardText
                style={[styles.cardTitle, { color: textPrimary }]}
                fontWeight="bold"
                size="md"
              >
                Total Received
              </StandardText>
            </View>
            <StandardText
              style={[styles.cardValue, { color: colors.success }]}
              fontWeight="bold"
              size="xl"
            >
              ₹{totalReceived.toLocaleString()}
            </StandardText>
          </Card>

          <Card
            style={[styles.summaryCard, { backgroundColor: cardBackground }]}
          >
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={24}
                color={colors.error}
              />
              <StandardText
                style={[styles.cardTitle, { color: textPrimary }]}
                fontWeight="bold"
                size="md"
              >
                Late Payments
              </StandardText>
            </View>
            <StandardText
              style={[styles.cardValue, { color: colors.error }]}
              fontWeight="bold"
              size="xl"
            >
              {latePayments}
            </StandardText>
          </Card>
        </View>

        <Gap size="lg" />

        {/* Search and Filter */}
        <View style={styles.controlsContainer}>
          <PaperInput
            mode="flat"
            placeholder="Search payments..."
            value={search}
            onChangeText={setSearch}
            style={[styles.searchBar, { fontFamily: 'Metropolis-Medium' }]}
            left={<PaperInput.Icon icon="magnify" />}
            underlineColor="transparent"
            activeUnderlineColor="transparent"
            contentStyle={{ fontFamily: 'Metropolis-Medium' }}
            theme={{
              roundness: 25,
              colors: {
                background: '#fff',
                text: '#000',
                placeholder: '#888',
              },
            }}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {[
              { key: 'all', label: 'All', icon: 'filter-variant' },
              { key: 'late', label: 'Late', icon: 'alert-circle-outline' },
              { key: 'cash', label: 'Cash', icon: 'cash' },
              { key: 'online', label: 'Online', icon: 'credit-card-outline' },
            ].map(filter => (
              <Chip
                key={filter.key}
                selected={selectedFilter === filter.key}
                selectedColor="#fff"
                onPress={() => setSelectedFilter(filter.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      selectedFilter === filter.key
                        ? colors.secondary
                        : '#f5f5f5',
                  },
                ]}
                textStyle={{
                  color: selectedFilter === filter.key ? '#fff' : '#000',
                  fontFamily: 'Metropolis-Medium',
                  fontWeight: selectedFilter === filter.key ? '600' : '400',
                }}
                icon={() => (
                  <MaterialCommunityIcons
                    name={filter.icon}
                    size={18}
                    color={selectedFilter === filter.key ? '#fff' : '#000'}
                  />
                )}
              >
                {filter.label}
              </Chip>
            ))}
          </ScrollView>
        </View>

        <Gap size="md" />

        {/* Payments List */}
        <StandardText
          fontWeight="bold"
          size="xl"
          style={[styles.sectionTitle, { color: textPrimary }]}
        >
          Payment History ({filteredPayments.length})
        </StandardText>

        <Gap size="md" />

        {filteredPayments.length > 0 ? (
          filteredPayments.map(payment => (
            <StandardCard
              key={payment.payment_id}
              style={[styles.paymentCard, { backgroundColor: cardBackground }]}
            >
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  <StandardText
                    fontWeight="bold"
                    size="lg"
                    style={[styles.tenantName, { color: textPrimary }]}
                  >
                    {payment.tenant_name}
                  </StandardText>
                  <StandardText
                    style={[styles.paymentDate, { color: textSecondary }]}
                  >
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </StandardText>
                </View>
                <View style={styles.paymentAmount}>
                  <StandardText
                    fontWeight="bold"
                    size="lg"
                    style={[styles.amount, { color: colors.success }]}
                  >
                    +₹{parseFloat(payment.amount).toLocaleString()}
                  </StandardText>
                  {payment.isLatePayment && (
                    <Chip
                      style={[
                        styles.lateChip,
                        { backgroundColor: colors.error + '20' },
                      ]}
                      textStyle={[styles.lateChipText, { color: colors.error }]}
                    >
                      Late
                    </Chip>
                  )}
                </View>
              </View>

              <Divider style={styles.divider} />

              <View style={styles.paymentDetails}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons
                    name="credit-card-outline"
                    size={16}
                    color={colors.secondary}
                  />
                  <StandardText
                    style={[styles.detailText, { color: textSecondary }]}
                  >
                    Method: {payment.paymentMethod || 'N/A'}
                  </StandardText>
                </View>

                {payment.transactionId && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons
                      name="hashtag"
                      size={16}
                      color={colors.secondary}
                    />
                    <StandardText
                      style={[styles.detailText, { color: textSecondary }]}
                    >
                      Transaction: {payment.transactionId}
                    </StandardText>
                  </View>
                )}

                {payment.recordedBy && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons
                      name="account-edit"
                      size={16}
                      color={colors.secondary}
                    />
                    <StandardText
                      style={[styles.detailText, { color: textSecondary }]}
                    >
                      Recorded by: {payment.recordedBy}
                    </StandardText>
                  </View>
                )}

                {payment.lateFee && parseFloat(payment.lateFee) > 0 && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons
                      name="cash-plus"
                      size={16}
                      color={colors.error}
                    />
                    <StandardText
                      style={[styles.detailText, { color: colors.error }]}
                    >
                      Late Fee: ₹{parseFloat(payment.lateFee).toLocaleString()}
                    </StandardText>
                  </View>
                )}

                {payment.notes && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons
                      name="note-text-outline"
                      size={16}
                      color={colors.secondary}
                    />
                    <StandardText
                      style={[styles.detailText, { color: textSecondary }]}
                    >
                      Notes: {payment.notes}
                    </StandardText>
                  </View>
                )}
              </View>
            </StandardCard>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="cash-remove"
              size={64}
              color={isDark ? colors.light_gray : colors.secondary}
            />
            <StandardText
              style={[styles.emptyText, { color: textPrimary }]}
              fontWeight="medium"
            >
              No payments found
            </StandardText>
            <StandardText
              style={[styles.emptySubtext, { color: textSecondary }]}
            >
              {search || selectedFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Payment records will appear here once tenants make payments'}
            </StandardText>
          </View>
        )}

        <Gap size="xxl" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
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
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 14,
  },
  cardValue: {
    fontSize: 20,
    marginTop: 4,
  },
  controlsContainer: {
    gap: 12,
  },
  searchBar: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 2,
    fontFamily: 'Metropolis-Medium',
  },
  filterContainer: {
    marginBottom: 8,
  },
  chip: { marginRight: 10, borderRadius: 20, elevation: 1 },
  sectionTitle: {
    marginBottom: 8,
  },
  paymentCard: {
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  tenantName: {
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 12,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    marginBottom: 4,
  },
  lateChip: {
    height: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  lateChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  paymentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 13,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Payments;
