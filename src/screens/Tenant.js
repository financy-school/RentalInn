import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Avatar, FAB, Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput as PaperInput } from 'react-native-paper';
import Share from 'react-native-share';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import AnimatedLoader from '../components/AnimatedLoader/AnimatedLoader';
import PropertySelector from '../components/PropertySelector/PropertySelector';
import SelectPropertyPrompt from '../components/SelectPropertyPrompt/SelectPropertyPrompt';
import {
  fetchTenants,
  putTenantOnNotice,
  deleteTenant,
} from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';
import { useProperty } from '../context/PropertyContext';
import colors from '../theme/colors';
import {
  PRIMARY,
  BACKGROUND,
  CARD_BACKGROUND,
  BORDER_STANDARD,
} from '../theme/colors';
import { RADIUS, PADDING, SHADOW } from '../theme/layout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Tenants = ({ navigation }) => {
  const { credentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);
  const { selectedProperty, isAllPropertiesSelected } = useProperty();

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // menu state
  const [activeMenuTenantId, setActiveMenuTenantId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null); // { x, y, width, height }

  const anchorRefs = useRef({}); // store refs to icon buttons

  const [tenants, setTenants] = useState([]);
  const [filterOptions, setFilterOptions] = useState([
    { label: 'All', key: 'all', value: 0 },
    { label: 'Dues', key: 'dues', value: 0 },
    { label: 'No Dues', key: 'no_dues', value: 0 },
    { label: 'Notice', key: 'notice', value: 0 },
  ]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Use selectedProperty from PropertyContext if specific property is selected,
      // otherwise don't fetch tenants when "All" is selected (tenants are property-specific)
      // const currentPropertyId = !isAllPropertiesSelected
      //   ? selectedProperty?.property_id
      //   : null;

      const currentPropertyId = selectedProperty?.property_id;

      if (!currentPropertyId) {
        // Don't show error when no property is selected - just clear data
        setTenants([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const res = await fetchTenants(
        credentials.accessToken,
        currentPropertyId,
      );
      const tenantsList = res.data.items || [];
      setTenants(tenantsList);

      const allCount = tenantsList.length;
      const duesCount = tenantsList.filter(t => t.has_dues).length;
      const noDuesCount = tenantsList.filter(t => !t.has_dues).length;
      const noticeCount = tenantsList.filter(t => t.is_on_notice).length;

      setFilterOptions([
        { label: 'All', key: 'all', value: allCount },
        { label: 'Dues', key: 'dues', value: duesCount },
        { label: 'No Dues', key: 'no_dues', value: noDuesCount },
        { label: 'Notice', key: 'notice', value: noticeCount },
      ]);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [credentials, selectedProperty]);

  // Filter tenants based on selectedFilter and search
  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.name
      .toLowerCase()
      .includes(search.toLowerCase());
    if (selectedFilter === 'dues') {
      return tenant.has_dues && matchesSearch;
    } else if (selectedFilter === 'no_dues') {
      return !tenant.has_dues && matchesSearch;
    } else if (selectedFilter === 'notice') {
      return tenant.is_on_notice && matchesSearch;
    }
    return matchesSearch;
  });

  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation, fetchData, search, selectedFilter]);

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Open menu by measuring position of the icon using measureInWindow
  const openMenu = tenantId => {
    const ref = anchorRefs.current[tenantId];
    if (!ref || !ref.measureInWindow) {
      // fallback: just open at center
      setMenuPosition({
        x: SCREEN_WIDTH / 2 - 80,
        y: 200,
        width: 0,
        height: 0,
      });
      setActiveMenuTenantId(tenantId);
      return;
    }

    ref.measureInWindow((x, y, width, height) => {
      setMenuPosition({ x, y, width, height });
      setActiveMenuTenantId(tenantId);
    });
  };

  const closeMenu = () => {
    setActiveMenuTenantId(null);
    setMenuPosition(null);
  };

  // 🔹 Share tenant details
  const handleShareTenant = async tenant => {
    try {
      const message =
        `👤 Tenant Details\n` +
        `Name: ${tenant.name || 'N/A'}\n` +
        `Phone: ${tenant.phone || 'N/A'}\n` +
        (tenant.alternate_phone
          ? `Alternate Phone: ${tenant.alternate_phone}\n`
          : '') +
        `Email: ${tenant.email || 'N/A'}\n` +
        `Room: ${tenant?.room?.name || 'No room assigned'}\n` +
        `Rent: ₹${tenant?.room?.rentAmount || 'N/A'}\n` +
        `Check-in Date: ${tenant.check_in_date || 'N/A'}\n` +
        `Check-out Date: ${tenant.check_out_date || 'N/A'}\n` +
        (tenant.lock_in_period
          ? `Lock-in Period: ${tenant.lock_in_period} months\n`
          : '') +
        (tenant.agreement_period
          ? `Agreement Period: ${tenant.agreement_period} months\n`
          : '') +
        (tenant.tenant_type ? `Tenant Type: ${tenant.tenant_type}\n` : '') +
        (tenant.has_dues ? `⚠️ Has outstanding dues\n` : '✅ No dues\n') +
        (tenant.is_on_notice ? `⚠️ On notice period\n` : '');

      await Share.open({
        title: 'Share Tenant Details',
        message,
      });
    } catch (err) {
      // User cancelled or error occurred
      console.log('Share cancelled or failed:', err);
    }
  };

  return (
    <View style={styles.container}>
      {/* Property Selector */}

      <View style={styles.propertySelectorContainer}>
        <PropertySelector
          navigation={navigation}
          requireSpecificProperty={false}
          actionContext="manage-tenants"
        />
      </View>

      {/* Main content */}
      <ScrollView
        onScrollBeginDrag={() => {
          // hide menu on scroll to avoid stale position
          closeMenu();
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Show SelectPropertyPrompt if no property is selected */}
        {/* {isAllPropertiesSelected ? (
          <SelectPropertyPrompt
            title="Select a Property"
            description="Please select a specific property to view and manage tenants. Tenants are organized by property."
            onSelectProperty={() => {
              // Scroll to top to show PropertySelector
            }}
          />
        ) : ( */}
        <>
          {/* Search */}
          <PaperInput
            mode="flat"
            placeholder="Search Tenants..."
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

          <Gap size="md" />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {filterOptions.map(option => (
              <Chip
                key={option.key}
                selected={selectedFilter === option.key}
                selectedColor="#fff"
                onPress={() => setSelectedFilter(option.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor:
                      selectedFilter === option.key
                        ? colors.secondary
                        : '#f5f5f5',
                  },
                ]}
                textStyle={{
                  color: selectedFilter === option.key ? '#fff' : '#000',
                  fontFamily: 'Metropolis-Medium',
                  fontWeight: selectedFilter === option.key ? '600' : '400',
                }}
              >
                {option.label} ({option.value})
              </Chip>
            ))}
          </ScrollView>

          {/* Loader */}
          {loading && (
            <AnimatedLoader
              message="Loading tenants..."
              icon="account-group"
              fullScreen={false}
            />
          )}

          {/* Empty State */}
          {!loading && filteredTenants.length === 0 && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="account-group-outline"
                size={80}
                color={colors.primary}
                style={styles.emptyIcon}
              />
              <StandardText style={styles.emptyText}>
                No tenants found
              </StandardText>
              <StandardText style={styles.emptySubtext}>
                Add your first tenant to start managing your property
              </StandardText>
            </View>
          )}

          {/* Tenant Cards */}
          {filteredTenants.map(tenant => (
            <StandardCard key={tenant.tenant_id} style={styles.card}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('TenantDetails', {
                    tenant_id: tenant.tenant_id,
                  })
                }
              >
                <View style={styles.row}>
                  {/* Avatar */}
                  <Avatar.Image
                    size={60}
                    source={{
                      uri: 'https://avatar.iran.liara.run/public/37',
                    }}
                    style={{ marginRight: 14 }}
                  />

                  {/* Info Section */}
                  <View style={{ flex: 1 }}>
                    <View style={styles.rowBetween}>
                      <StandardText fontWeight="bold" size="lg">
                        {tenant.name}
                      </StandardText>

                      {/* anchor button (we keep ref on this button) */}
                      <TouchableOpacity
                        ref={r => (anchorRefs.current[tenant.tenant_id] = r)}
                        onPress={() => openMenu(tenant.tenant_id)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <MaterialCommunityIcons
                          name="dots-vertical"
                          size={22}
                          color="#444"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Quick badges */}
                    <View style={{ flexDirection: 'row', marginTop: 6 }}>
                      {tenant.has_dues && (
                        <Chip
                          style={styles.badgeDues}
                          textStyle={{ color: '#fff' }}
                        >
                          Dues
                        </Chip>
                      )}
                      {tenant.is_on_notice && (
                        <Chip
                          style={styles.badgeNotice}
                          textStyle={{
                            color: '#fff',
                            fontFamily: 'Metropolis-Medium',
                            fontSize: 14,
                            lineHeight: 16, // Add this to help with vertical centering
                            textAlignVertical: 'center', // Add this to help with vertical centering
                          }}
                        >
                          Notice
                        </Chip>
                      )}
                    </View>

                    {/* Small details */}
                    <View style={{ marginTop: 8 }}>
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons
                          name="bed"
                          size={18}
                          color="#555"
                        />
                        <StandardText style={styles.detailText}>
                          {tenant?.room?.name || 'No room assigned'}
                        </StandardText>
                      </View>

                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons
                          name="cash"
                          size={18}
                          color="#555"
                        />
                        <StandardText style={styles.detailText}>
                          ₹{tenant?.room?.rentAmount || 'N/A'}
                        </StandardText>
                      </View>

                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons
                          name="calendar-check"
                          size={18}
                          color="#555"
                        />
                        <StandardText style={styles.detailText}>
                          Joined: {tenant.check_in_date}
                        </StandardText>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </StandardCard>
          ))}

          <Gap size="xl" />
        </>
        {/* )} */}
      </ScrollView>

      {/* Floating Add Button */}
      <FAB
        icon="plus"
        color="#fff"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTenant')}
      />

      {/* CUSTOM MENU OVERLAY (renders at top level using measured coords) */}
      {activeMenuTenantId && menuPosition && (
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => closeMenu()}
        >
          <View
            style={[
              styles.popup,
              {
                top: menuPosition.y + menuPosition.height + 6,
                left: Math.max(8, Math.min(menuPosition.x, SCREEN_WIDTH - 180)),
              },
            ]}
          >
            {/* Edit */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                const selectedTenant = tenants.find(
                  t => t.tenant_id === activeMenuTenantId,
                );
                navigation.navigate('AddTenant', {
                  tenant: selectedTenant,
                  isEdit: true,
                });
              }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={18}
                color="#555"
                style={{ marginRight: 10 }}
              />
              <StandardText>Edit</StandardText>
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                const selectedTenant = tenants.find(
                  t => t.tenant_id === activeMenuTenantId,
                );
                if (selectedTenant) {
                  handleShareTenant(selectedTenant);
                }
              }}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={18}
                color="#555"
                style={{ marginRight: 10 }}
              />
              <StandardText>Share</StandardText>
            </TouchableOpacity>

            {/* Put on Notice */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                putTenantOnNotice(credentials.accessToken, activeMenuTenantId, {
                  notice: true,
                });
                closeMenu();
                fetchData();
              }}
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={18}
                color="#e53935"
                style={{ marginRight: 10 }}
              />
              <StandardText>Put on Notice</StandardText>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                await deleteTenant(credentials.accessToken, activeMenuTenantId);
                closeMenu();
                fetchData();
              }}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={18}
                color="#e53935"
                style={{ marginRight: 10 }}
              />
              <StandardText>Delete</StandardText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  searchBar: {
    marginBottom: 10,
    backgroundColor: CARD_BACKGROUND,
    borderRadius: RADIUS.round,
    elevation: 4,
    fontFamily: 'Metropolis-Medium',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: BORDER_STANDARD,
  },
  filterContainer: { flexDirection: 'row', marginBottom: 16 },
  chip: {
    marginRight: 10,
    borderRadius: 22,
    elevation: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  card: {
    backgroundColor: CARD_BACKGROUND,
    borderRadius: RADIUS.large,
    padding: PADDING.large,
    marginVertical: 10,
    shadowColor: PRIMARY,
    ...SHADOW.strong,
    borderWidth: 1,
    borderColor: BORDER_STANDARD,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  detailText: { marginLeft: 6, color: '#444' },
  badgeDues: {
    backgroundColor: '#e53935',
    marginRight: 6,
    height: 26,
  },
  badgeNotice: {
    backgroundColor: colors.primary,
    height: 26,
    marginRight: 6, // Add margin for consistency with badgeDues
  },
  fab: {
    position: 'absolute',
    right: 30,
    borderRadius: 30,
    bottom: 30,
    backgroundColor: colors.secondary,
  },

  /* overlay + popup styles */
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
    backgroundColor: CARD_BACKGROUND,
    borderRadius: RADIUS.medium,
    paddingVertical: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: BORDER_STANDARD,
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
    paddingHorizontal: 16,
  },
  propertySelectorContainer: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

import withAuthProtection from '../components/withAuthProtection';

export default withAuthProtection(Tenants);
