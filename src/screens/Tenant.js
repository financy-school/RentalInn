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
} from 'react-native';
import { Avatar, FAB, Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput as PaperInput } from 'react-native-paper';
import Share from 'react-native-share';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import {
  fetchTenants,
  putTenantOnNotice,
  deleteTenant,
} from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';
import colors from '../theme/color';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Tenants = ({ navigation }) => {
  const { credentials } = useContext(CredentialsContext);
  const { theme: mode } = useContext(ThemeContext);

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [loading, setLoading] = useState(true);

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
      const res = await fetchTenants(
        credentials.accessToken,
        credentials.property_id,
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
  }, [credentials]);

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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Main content */}
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        onScrollBeginDrag={() => {
          // hide menu on scroll to avoid stale position
          closeMenu();
        }}
      >
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
          <View style={{ padding: 20, alignItems: 'center' }}>
            <StandardText>Loading tenants...</StandardText>
          </View>
        )}

        {/* Tenant Cards */}
        {filteredTenants.map(tenant => (
          <StandardCard key={tenant.id} style={styles.card}>
            <TouchableOpacity
              onPress={() => navigation.navigate('TenantDetails', { tenant })}
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
                      ref={r => (anchorRefs.current[tenant.id] = r)}
                      onPress={() => openMenu(tenant.id)}
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
                  t => t.id === activeMenuTenantId,
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
                  t => t.id === activeMenuTenantId,
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
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 2,
    fontFamily: 'Metropolis-Medium',
  },
  chip: { marginRight: 10, borderRadius: 20, elevation: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
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
    bottom: 120,
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
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

import withAuthProtection from '../components/withAuthProtection';

export default withAuthProtection(Tenants);
