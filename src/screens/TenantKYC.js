import React, { useState } from 'react';
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

const TenantKYC = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [tenantData] = useState([
    {
      id: 1,
      name: 'John Smith',
      room: 'A101',
      phone: '+1 (555) 123-4567',
      email: 'john.smith@email.com',
      kycStatus: 'verified',
      documents: ['ID Card', 'Address Proof', 'Photo'],
      joinDate: '2024-01-15',
      completedSteps: 3,
      totalSteps: 3,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      room: 'B202',
      phone: '+1 (555) 234-5678',
      email: 'sarah.johnson@email.com',
      kycStatus: 'pending',
      documents: ['ID Card', 'Photo'],
      joinDate: '2024-02-01',
      completedSteps: 2,
      totalSteps: 3,
    },
    {
      id: 3,
      name: 'Mike Wilson',
      room: 'C103',
      phone: '+1 (555) 345-6789',
      email: 'mike.wilson@email.com',
      kycStatus: 'incomplete',
      documents: ['ID Card'],
      joinDate: '2024-02-10',
      completedSteps: 1,
      totalSteps: 3,
    },
    {
      id: 4,
      name: 'Emily Davis',
      room: 'A205',
      phone: '+1 (555) 456-7890',
      email: 'emily.davis@email.com',
      kycStatus: 'verified',
      documents: ['ID Card', 'Address Proof', 'Photo'],
      joinDate: '2024-01-20',
      completedSteps: 3,
      totalSteps: 3,
    },
    {
      id: 5,
      name: 'Robert Brown',
      room: 'B301',
      phone: '+1 (555) 567-8901',
      email: 'robert.brown@email.com',
      kycStatus: 'pending',
      documents: ['ID Card', 'Address Proof'],
      joinDate: '2024-02-05',
      completedSteps: 2,
      totalSteps: 3,
    },
  ]);

  const filterOptions = [
    { key: 'all', label: 'All', count: tenantData.length },
    {
      key: 'verified',
      label: 'Verified',
      count: tenantData.filter(t => t.kycStatus === 'verified').length,
    },
    {
      key: 'pending',
      label: 'Pending',
      count: tenantData.filter(t => t.kycStatus === 'pending').length,
    },
    {
      key: 'incomplete',
      label: 'Incomplete',
      count: tenantData.filter(t => t.kycStatus === 'incomplete').length,
    },
  ];

  const filteredTenants = tenantData.filter(tenant => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      selectedFilter === 'all' || tenant.kycStatus === selectedFilter;

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
    navigation.navigate('TenantDetails', { tenantId: tenant.tenant_id });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const renderTenantItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleTenantPress(item)}>
      <StandardCard style={styles.tenantCard}>
        <View style={styles.tenantHeader}>
          <View style={styles.tenantInfo}>
            <StandardText size="md" fontWeight="bold" style={styles.tenantName}>
              {item.name}
            </StandardText>
            <StandardText size="sm" style={styles.tenantRoom}>
              Room {item.room}
            </StandardText>
          </View>
          <View
            style={[
              styles.statusIcon,
              { backgroundColor: getKYCStatusColor(item.kycStatus) },
            ]}
          >
            <MaterialCommunityIcons
              name={getKYCStatusIcon(item.kycStatus)}
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
                {item.phone}
              </StandardText>
            </View>
            <View style={styles.contactItem}>
              <MaterialCommunityIcons
                name="email"
                size={16}
                color={colors.textSecondary}
              />
              <StandardText size="sm" style={styles.contactText}>
                {item.email}
              </StandardText>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <StandardText size="sm" style={styles.progressLabel}>
                KYC Progress
              </StandardText>
              <StandardText size="sm" style={styles.progressText}>
                {item.completedSteps}/{item.totalSteps} completed
              </StandardText>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(item.completedSteps / item.totalSteps) * 100}%`,
                    backgroundColor: getKYCStatusColor(item.kycStatus),
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
              {item.documents.map((doc, index) => (
                <View key={index} style={styles.documentChip}>
                  <StandardText size="xs" style={styles.documentChipText}>
                    {doc}
                  </StandardText>
                </View>
              ))}
            </View>
          </View>
        </View>
      </StandardCard>
    </TouchableOpacity>
  );

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
                  {tenantData.filter(t => t.kycStatus === 'verified').length}
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
                  {tenantData.filter(t => t.kycStatus === 'pending').length}
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
                  {tenantData.filter(t => t.kycStatus === 'incomplete').length}
                </StandardText>
                <StandardText size="sm" style={styles.statLabel}>
                  Incomplete
                </StandardText>
              </View>
            </View>

            <FlatList
              data={filteredTenants}
              renderItem={renderTenantItem}
              keyExtractor={item => item.tenant_id}
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
});

export default TenantKYC;
