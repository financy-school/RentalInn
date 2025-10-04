import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';

import { TextInput as PaperInput } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import colors from '../theme/color';
import { CredentialsContext } from '../context/CredentialsContext';
import { useProperty } from '../context/PropertyContext';
import { fetchKYCData } from '../services/NetworkUtils';
import withAuthProtection from '../components/withAuthProtection';

const TenantKYC = ({ navigation }) => {
  const { credentials } = useContext(CredentialsContext);
  const { selectedProperty, isAllPropertiesSelected } = useProperty();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [kycData, setKycData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchKYCDataCallback = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentPropertyId = selectedProperty?.property_id;
      const response = await fetchKYCData(
        credentials.accessToken,
        currentPropertyId,
      );

      if (response.success) {
        const kycList = response.data.items || response.data || [];
        setKycData(kycList);
      } else {
        setError(response.error || 'Failed to fetch KYC data');
        setKycData([]);
      }
    } catch (err) {
      console.error('Error fetching KYC data:', err);
      setError('Failed to fetch KYC data');
      setKycData([]);
    } finally {
      setLoading(false);
    }
  }, [credentials, selectedProperty]);

  useEffect(() => {
    fetchKYCDataCallback();
  }, [fetchKYCDataCallback]);

  const filterOptions = [
    { key: 'all', label: 'All', count: kycData.length },
    {
      key: 'verified',
      label: 'Verified',
      count: kycData.filter(t => t.status === 'verified').length,
    },
    {
      key: 'pending',
      label: 'Pending',
      count: kycData.filter(t => t.status === 'pending').length,
    },
    {
      key: 'incomplete',
      label: 'Incomplete',
      count: kycData.filter(t => t.status === 'incomplete').length,
    },
  ];
  const filteredTenants = kycData.filter(tenant => {
    const tenantInfo = tenant.tenant || {};
    const matchesSearch =
      (tenantInfo.name || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (tenantInfo.room_id || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (tenantInfo.email || '')
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' || tenant.status === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  const getKYCStatusColor = status => {
    switch (status) {
      case 'verified':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'incomplete':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getKYCStatusIcon = status => {
    switch (status) {
      case 'verified':
        return 'check-circle';
      case 'pending':
        return 'clock-outline';
      case 'incomplete':
        return 'alert-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const handleTenantPress = tenant => {
    const tenantInfo = tenant.tenant || {};
    navigation.navigate('TenantDetails', { tenant_id: tenantInfo.tenant_id });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchKYCDataCallback().finally(() => setRefreshing(false));
  };

  const renderTenantItem = ({ item }) => {
    const tenantInfo = item.tenant || {};

    // Create documents array from KYC fields
    const documents = [];
    if (item.documentType) documents.push(item.documentType);
    if (item.documentNumber) documents.push(`ID: ${item.documentNumber}`);

    // Calculate progress based on available fields
    const totalSteps = 3; // ID Card, Address Proof, Photo
    let completedSteps = 0;
    if (item.documentType) completedSteps++;
    if (item.documentNumber) completedSteps++;
    if (item.documentUrl) completedSteps++;

    return (
      <TouchableOpacity onPress={() => handleTenantPress(item)}>
        <StandardCard style={styles.tenantCard}>
          <View style={styles.tenantHeader}>
            <View style={styles.tenantInfo}>
              <StandardText
                size="md"
                fontWeight="bold"
                style={styles.tenantName}
              >
                {tenantInfo.name || 'Unknown Tenant'}
              </StandardText>
              <StandardText size="sm" style={styles.tenantRoom}>
                Room {tenantInfo.room_id || 'N/A'}
              </StandardText>
            </View>
            <View
              style={[
                styles.statusIcon,
                { backgroundColor: getKYCStatusColor(item.status) },
              ]}
            >
              <MaterialCommunityIcons
                name={getKYCStatusIcon(item.status)}
                size={20}
                color={colors.white}
              />
            </View>
          </View>

          <View style={styles.tenantDetails}>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <MaterialCommunityIcons
                  name="phone"
                  size={16}
                  color={colors.textSecondary}
                />
                <StandardText size="sm" style={styles.contactText}>
                  {tenantInfo.phone_number || 'N/A'}
                </StandardText>
              </View>
              <View style={styles.contactItem}>
                <MaterialCommunityIcons
                  name="email"
                  size={16}
                  color={colors.textSecondary}
                />
                <StandardText size="sm" style={styles.contactText}>
                  {tenantInfo.email || 'N/A'}
                </StandardText>
              </View>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressInfo}>
                <StandardText size="sm" style={styles.progressLabel}>
                  KYC Progress
                </StandardText>
                <StandardText size="sm" style={styles.progressText}>
                  {completedSteps}/{totalSteps} completed
                </StandardText>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(completedSteps / totalSteps) * 100}%`,
                      backgroundColor: getKYCStatusColor(item.status),
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.documentsSection}>
              <StandardText size="sm" style={styles.documentsLabel}>
                Documents:
              </StandardText>
              <View style={styles.documentsList}>
                {documents.length > 0 ? (
                  documents.map((doc, index) => (
                    <View key={index} style={styles.documentChip}>
                      <StandardText size="xs" style={styles.documentChipText}>
                        {doc}
                      </StandardText>
                    </View>
                  ))
                ) : (
                  <View style={styles.documentChip}>
                    <StandardText size="xs" style={styles.documentChipText}>
                      No documents uploaded
                    </StandardText>
                  </View>
                )}
              </View>
            </View>
          </View>
        </StandardCard>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.wrapper}>
          <StandardHeader title="Tenant KYC" navigation={navigation} />

          <View style={styles.container}>
            <PaperInput
              mode="flat"
              placeholder="Search Tenants..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
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

            <View style={styles.filtersContainer}>
              {filterOptions.map(filter => (
                <TouchableOpacity
                  key={filter.key}
                  onPress={() => setSelectedFilter(filter.key)}
                  style={[
                    styles.filterChip,
                    selectedFilter === filter.key && styles.filterChipActive,
                  ]}
                >
                  <StandardText
                    size="sm"
                    style={[
                      styles.filterText,
                      selectedFilter === filter.key && styles.filterTextActive,
                    ]}
                  >
                    {filter.label} ({filter.count})
                  </StandardText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.summaryStats}>
              <View style={styles.statItem}>
                <StandardText
                  size="xl"
                  fontWeight="bold"
                  style={[styles.statValue, { color: colors.success }]}
                >
                  {kycData.filter(t => t.status === 'verified').length}
                </StandardText>
                <StandardText size="sm" style={styles.statLabel}>
                  Verified
                </StandardText>
              </View>
              <View style={styles.statItem}>
                <StandardText
                  size="xl"
                  fontWeight="bold"
                  style={[styles.statValue, { color: colors.warning }]}
                >
                  {kycData.filter(t => t.status === 'pending').length}
                </StandardText>
                <StandardText size="sm" style={styles.statLabel}>
                  Pending
                </StandardText>
              </View>
              <View style={styles.statItem}>
                <StandardText
                  size="xl"
                  fontWeight="bold"
                  style={[styles.statValue, { color: colors.error }]}
                >
                  {kycData.filter(t => t.status === 'incomplete').length}
                </StandardText>
                <StandardText size="sm" style={styles.statLabel}>
                  Incomplete
                </StandardText>
              </View>
            </View>

            {/* Loading State */}
            {loading && (
              <View style={styles.loadingContainer}>
                <StandardText>Loading KYC data...</StandardText>
              </View>
            )}

            {/* Error State */}
            {error && !loading && (
              <View style={styles.errorContainer}>
                <StandardText style={styles.errorText}>{error}</StandardText>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchKYCDataCallback}
                >
                  <StandardText style={styles.retryText}>Retry</StandardText>
                </TouchableOpacity>
              </View>
            )}

            {/* KYC List */}
            {!loading && !error && (
              <FlatList
                data={filteredTenants}
                renderItem={renderTenantItem}
                keyExtractor={item => item.tenant_id || item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={[colors.primary]}
                  />
                }
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons
                      name="account-search-outline"
                      size={64}
                      color={colors.textSecondary}
                    />
                    <StandardText size="md" style={styles.emptyText}>
                      No tenants found
                    </StandardText>
                    <StandardText size="sm" style={styles.emptySubtext}>
                      Try adjusting your search or filter criteria
                    </StandardText>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },

  searchBar: {
    marginVertical: 16,
    backgroundColor: colors.white,
    elevation: 2,
    borderRadius: 25,
  },

  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.accent,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent,
  },

  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  filterText: {
    color: colors.textSecondary,
  },

  filterTextActive: {
    color: colors.white,
  },

  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 16,
    elevation: 2,
  },

  statItem: {
    alignItems: 'center',
  },

  statValue: {
    fontWeight: 'bold',
  },

  statLabel: {
    color: colors.textSecondary,
    marginTop: 4,
  },

  listContainer: {
    paddingBottom: 20,
  },

  tenantCard: {
    marginBottom: 12,
    padding: 16,
  },

  tenantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  tenantInfo: {
    flex: 1,
  },

  tenantName: {
    fontWeight: '600',
    color: colors.textPrimary,
  },

  tenantRoom: {
    color: colors.textSecondary,
    marginTop: 2,
  },

  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tenantDetails: {
    gap: 12,
  },

  contactInfo: {
    gap: 6,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  contactText: {
    color: colors.textSecondary,
  },

  progressSection: {
    gap: 6,
  },

  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  progressLabel: {
    color: colors.textSecondary,
  },

  progressText: {
    color: colors.textPrimary,
    fontWeight: '500',
  },

  progressBar: {
    height: 6,
    backgroundColor: colors.accent,
    borderRadius: 3,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  documentsSection: {
    gap: 6,
  },

  documentsLabel: {
    color: colors.textSecondary,
  },

  documentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  documentChip: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    height: 28,
    justifyContent: 'center',
  },

  documentChipText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyText: {
    marginTop: 16,
    color: colors.textPrimary,
  },

  emptySubtext: {
    marginTop: 4,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: 'bold',
  },
});

export default withAuthProtection(TenantKYC);
