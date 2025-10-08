import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Chip, Card, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import AnimatedLoader from '../components/AnimatedLoader/AnimatedLoader';
import colors from '../theme/colors';
import { SPACING, RADIUS, SHADOW, PADDING } from '../theme/layout';
import {
  deleteTenant,
  getDocument,
  getRoom,
  getTenants,
  putTenantOnNotice,
} from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RoomDetails = ({ navigation, route }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);
  const { property_id, room_id } = route.params;

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Theme variables
  const isDark = mode === 'dark';

  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  const scrollX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  const [imageUrls, setImageUrls] = useState([]);
  const [tenants, setTenants] = useState([]);

  // Fetch room details if roomId is provided but no room data
  useEffect(() => {
    if (room_id && property_id && credentials?.accessToken) {
      const fetchRoomDetails = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await getRoom(
            credentials.accessToken,
            property_id,
            room_id,
          );

          if (response.success) {
            setRoom(response.data);
          } else {
            setError(response.error || 'Failed to fetch room details');
            console.error('Failed to fetch room details:', response.error);
          }
        } catch (err) {
          setError('Unable to fetch room details. Please try again.');
          console.error('Error fetching room details:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchRoomDetails();
    }
  }, [room_id, credentials, property_id]);

  useEffect(() => {
    if (!room) return;

    const fetchImageUrls = async () => {
      if (
        room.image_document_id_list &&
        room.image_document_id_list.length > 0
      ) {
        const urls = await Promise.all(
          room.image_document_id_list.map(async docId => {
            try {
              const res = await getDocument(
                credentials.accessToken,
                property_id,
                docId,
              );
              return res.data.download_url;
            } catch (e) {
              console.error('Error fetching document for ID', docId, e);
              return null;
            }
          }),
        );
        setImageUrls(urls.filter(Boolean));
      }
    };

    const fetchTenants = async () => {
      try {
        const res = await getTenants(
          credentials.accessToken,
          property_id,
          room.room_id,
        );
        if (res.success) {
          setTenants(res.data);
        } else {
          console.error('Failed to fetch tenants:', res.error);
          setTenants([]);
        }
      } catch (err) {
        console.error('Error fetching tenants:', err);
        setTenants([]);
      }
    };

    fetchImageUrls();
    fetchTenants();
  }, [room, credentials, property_id]);

  // ===== CUSTOM MENU STATE =====
  const [activeMenuTenantId, setActiveMenuTenantId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const anchorRefs = useRef({});

  const openMenu = tenantId => {
    const ref = anchorRefs.current[tenantId];
    if (!ref) {
      setMenuPosition({
        x: SCREEN_WIDTH - 180,
        y: 300,
        width: 0,
        height: 0,
      });
      setActiveMenuTenantId(tenantId);
      return;
    }

    ref.measureInWindow((x, y, width, height) => {
      console.log('Menu positioning:', { x, y, width, height, SCREEN_WIDTH });

      // Calculate menu position - position it ABOVE the three-dot button
      const menuWidth = 160;
      const menuHeight = 140; // Approximate height of menu with 3 items
      const menuX = Math.max(10, SCREEN_WIDTH - menuWidth - 10); // 10px from right edge
      const menuY = y - menuHeight - 8; // Above the button with 8px gap

      console.log('Calculated menu position:', { menuX, menuY });

      setMenuPosition({
        x: menuX,
        y: menuY,
        width,
        height,
      });
      setActiveMenuTenantId(tenantId);
    });
  };

  const closeMenu = () => {
    setActiveMenuTenantId(null);
    setMenuPosition(null);
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <StandardHeader navigation={navigation} title="Room Details" />
        <AnimatedLoader
          message="Loading room details..."
          icon="home-search"
          fullScreen={false}
        />
      </View>
    );
  }

  // Error state
  if (error || !room) {
    return (
      <View style={styles.container}>
        <StandardHeader navigation={navigation} title="Room Details" />
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="home-alert"
            size={64}
            color={isDark ? colors.light_gray : colors.error}
          />
          <StandardText
            style={[styles.errorTitle, { color: textPrimary }]}
            fontWeight="bold"
          >
            Unable to Load Room
          </StandardText>
          <StandardText style={[styles.errorMessage, { color: textSecondary }]}>
            {error ||
              'Room details could not be found. Please check if the room exists and try again.'}
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

  // Calculate statistics from API data
  const activeTickets = room.tickets
    ? room.tickets.filter(ticket => ticket.status !== 'CLOSED')
    : [];
  const activeTicketsCount = activeTickets.length;
  const latestTicketMessage =
    activeTickets.length > 0
      ? activeTickets[0].issue || 'Issue reported'
      : 'No active issues';

  const rentDueRentals = room.rentals
    ? room.rentals.filter(
        rental =>
          parseFloat(rental.outstandingAmount) > 0 ||
          rental.paymentStatus === 'pending',
      )
    : [];
  const rentDueCount = rentDueRentals.length;

  const tenantsOnNotice = tenants.filter(tenant => tenant.is_on_notice);
  const underNoticeCount = tenantsOnNotice.length;

  return (
    <View style={styles.container}>
      <StandardHeader navigation={navigation} title="Room Details" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={closeMenu}
      >
        {/* ===== Image Carousel ===== */}
        <View style={styles.imageCarouselContainer}>
          <Animated.ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false },
            )}
            scrollEventThrottle={16}
          >
            {imageUrls.length > 0 ? (
              imageUrls.map((img, index) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.carouselImage}
                />
              ))
            ) : (
              <View style={[styles.carouselImage, styles.placeholderImage]}>
                <MaterialCommunityIcons
                  name="home-outline"
                  size={80}
                  color={colors.primary}
                />
                <StandardText
                  style={[styles.placeholderText, { color: textSecondary }]}
                  fontWeight="500"
                >
                  No Images Available
                </StandardText>
              </View>
            )}
          </Animated.ScrollView>

          {/* Dots */}
          {imageUrls.length > 1 && (
            <View style={styles.dotsContainer}>
              {imageUrls.map((_, index) => {
                const opacity = scrollX.interpolate({
                  inputRange: [
                    screenWidth * (index - 1),
                    screenWidth * index,
                    screenWidth * (index + 1),
                  ],
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: 'clamp',
                });
                return (
                  <Animated.View
                    key={index}
                    style={[styles.dot, { opacity }]}
                  />
                );
              })}
            </View>
          )}
        </View>

        {/* ===== Room Header ===== */}
        <Card
          style={[styles.roomHeaderCard, { backgroundColor: cardBackground }]}
        >
          <View style={styles.roomHeaderContent}>
            <View style={styles.roomTitleSection}>
              <MaterialCommunityIcons
                name="door"
                size={32}
                color={colors.primary}
              />
              <StandardText
                style={[styles.roomTitle, { color: textPrimary }]}
                fontWeight="bold"
                size="xl"
              >
                Room {room.name}
              </StandardText>
            </View>
            <Chip
              style={[
                styles.statusChip,
                {
                  backgroundColor:
                    room.status === 'vacant' || room.available
                      ? colors.success + '20'
                      : colors.warning + '20',
                },
              ]}
              textStyle={[
                styles.statusText,
                {
                  color:
                    room.status === 'vacant' || room.available
                      ? colors.success
                      : colors.warning,
                },
              ]}
            >
              {room.available ? 'Available' : 'Occupied'}
            </Chip>
          </View>
        </Card>

        <Gap size="md" />

        {/* ===== Content ===== */}
        <View style={styles.contentContainer}>
          {/* Room Statistics Cards */}
          <View style={styles.statisticsGrid}>
            {/* Bed Information Card */}
            <Card
              style={[
                styles.statisticsCard,
                { backgroundColor: cardBackground },
              ]}
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="bed"
                  size={24}
                  color={colors.primary}
                />
                <StandardText
                  style={[styles.cardTitle, { color: textPrimary }]}
                  fontWeight="bold"
                  size="md"
                >
                  Bed Information
                </StandardText>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.statRow}>
                  <StandardText
                    style={[styles.statLabel, { color: textSecondary }]}
                  >
                    Total Beds:
                  </StandardText>
                  <StandardText
                    style={[styles.statValue, { color: colors.primary }]}
                    fontWeight="bold"
                  >
                    {room.bedCount}
                  </StandardText>
                </View>
                <View style={styles.statRow}>
                  <StandardText
                    style={[styles.statLabel, { color: textSecondary }]}
                  >
                    Available:
                  </StandardText>
                  <StandardText
                    style={[styles.statValue, { color: colors.success }]}
                    fontWeight="bold"
                  >
                    {room.bedCount - tenants.length}
                  </StandardText>
                </View>
                <View style={styles.statRow}>
                  <StandardText
                    style={[styles.statLabel, { color: textSecondary }]}
                  >
                    Occupied:
                  </StandardText>
                  <StandardText
                    style={[styles.statValue, { color: colors.warning }]}
                    fontWeight="bold"
                  >
                    {tenants.length}
                  </StandardText>
                </View>
              </View>
            </Card>

            {/* Rent Due Card */}
            <Card
              style={[
                styles.statisticsCard,
                { backgroundColor: cardBackground },
              ]}
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="cash"
                  size={24}
                  color={colors.error}
                />
                <StandardText
                  style={[styles.cardTitle, { color: textPrimary }]}
                  fontWeight="bold"
                  size="md"
                >
                  Rent Due
                </StandardText>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.statRow}>
                  <StandardText
                    style={[styles.statLabel, { color: textSecondary }]}
                  >
                    Count:
                  </StandardText>
                  <StandardText
                    style={[styles.statValue, { color: colors.error }]}
                    fontWeight="bold"
                  >
                    {rentDueCount}
                  </StandardText>
                </View>
                {rentDueRentals.slice(0, 2).map((rental, idx) => (
                  <View key={idx} style={styles.tenantRow}>
                    <MaterialCommunityIcons
                      name="account-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <StandardText
                      style={[styles.tenantName, { color: textPrimary }]}
                    >
                      {tenants.find(t => t.tenant_id === rental.tenant_id)
                        ?.name || 'Tenant'}
                    </StandardText>
                  </View>
                ))}
              </View>
            </Card>

            {/* Active Tickets Card */}
            <Card
              style={[
                styles.statisticsCard,
                { backgroundColor: cardBackground },
              ]}
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="ticket-confirmation"
                  size={24}
                  color={colors.warning}
                />
                <StandardText
                  style={[styles.cardTitle, { color: textPrimary }]}
                  fontWeight="bold"
                  size="md"
                >
                  Active Tickets
                </StandardText>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.statRow}>
                  <StandardText
                    style={[styles.statLabel, { color: textSecondary }]}
                  >
                    Count:
                  </StandardText>
                  <StandardText
                    style={[styles.statValue, { color: colors.warning }]}
                    fontWeight="bold"
                  >
                    {activeTicketsCount}
                  </StandardText>
                </View>
                <StandardText
                  style={[styles.ticketMessage, { color: textSecondary }]}
                >
                  {latestTicketMessage}
                </StandardText>
              </View>
            </Card>

            {/* Under Notice Card */}
            <Card
              style={[
                styles.statisticsCard,
                { backgroundColor: cardBackground },
              ]}
            >
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons
                  name="calendar-alert"
                  size={24}
                  color={colors.error}
                />
                <StandardText
                  style={[styles.cardTitle, { color: textPrimary }]}
                  fontWeight="bold"
                  size="md"
                >
                  Under Notice
                </StandardText>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.statRow}>
                  <StandardText
                    style={[styles.statLabel, { color: textSecondary }]}
                  >
                    Count:
                  </StandardText>
                  <StandardText
                    style={[styles.statValue, { color: colors.error }]}
                    fontWeight="bold"
                  >
                    {underNoticeCount}
                  </StandardText>
                </View>
                {tenantsOnNotice.slice(0, 1).map((tenant, idx) => (
                  <View key={idx} style={styles.tenantRow}>
                    <MaterialCommunityIcons
                      name="account-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <StandardText
                      style={[styles.tenantName, { color: textPrimary }]}
                    >
                      {tenant.name || 'Tenant'}
                    </StandardText>
                  </View>
                ))}
              </View>
            </Card>
          </View>

          <Gap size="lg" />

          {/* Amenities Section */}
          <Card
            style={[styles.amenitiesCard, { backgroundColor: cardBackground }]}
          >
            <StandardText
              fontWeight="bold"
              size="lg"
              style={[styles.sectionTitle, { color: textPrimary }]}
            >
              Amenities
            </StandardText>
            <View style={styles.amenitiesContainer}>
              {(room.amenities
                ? room.amenities.split(',').map(item => item.trim())
                : ['WiFi', 'AC', 'Heater', 'Wardrobe', 'Attached Bathroom']
              ).map((item, idx) => (
                <Chip
                  key={idx}
                  style={[
                    styles.amenityChip,
                    { backgroundColor: colors.accent },
                  ]}
                  textStyle={[styles.amenityText, { color: colors.primary }]}
                  icon="check"
                >
                  {item}
                </Chip>
              ))}
            </View>
          </Card>

          <Gap size="lg" />

          {/* Tenants Section */}
          <View style={styles.tenantsSectionHeader}>
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color={colors.primary}
            />
            <StandardText
              fontWeight="bold"
              size="lg"
              style={[styles.tenantsSectionTitle, { color: textPrimary }]}
            >
              Tenants in this Room ({tenants.length})
            </StandardText>
          </View>

          <Gap size="md" />

          <View style={styles.tenantsContainer}>
            {tenants.length === 0 ? (
              <StandardCard
                style={[
                  styles.emptyTenantsCard,
                  { backgroundColor: cardBackground },
                ]}
              >
                <MaterialCommunityIcons
                  name="account-off-outline"
                  size={48}
                  color={colors.textSecondary}
                />
                <StandardText
                  size="md"
                  style={[styles.emptyText, { color: textSecondary }]}
                >
                  No tenants in this room
                </StandardText>
              </StandardCard>
            ) : (
              tenants.map((tenant, index) => (
                <TouchableOpacity
                  key={tenant.tenant_id}
                  style={[
                    styles.tenantItem,
                    { backgroundColor: cardBackground },
                  ]}
                  onPress={() =>
                    navigation.navigate('TenantDetails', {
                      tenant_id: tenant.tenant_id,
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.tenantLeft}>
                    {/* Tenant Avatar/Rank Badge */}
                    <View
                      style={[
                        styles.tenantRank,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="account"
                        size={20}
                        color={colors.white}
                      />
                    </View>

                    {/* Tenant Info */}
                    <View style={styles.tenantInfo}>
                      <View style={styles.tenantNameRow}>
                        <StandardText
                          size="md"
                          fontWeight="bold"
                          style={{ color: textPrimary }}
                          numberOfLines={1}
                        >
                          {tenant.name}
                        </StandardText>

                        {/* Badges */}
                        {tenant.has_dues && (
                          <View
                            style={[
                              styles.inlineBadge,
                              { backgroundColor: colors.error },
                            ]}
                          >
                            <StandardText
                              size="xs"
                              fontWeight="bold"
                              style={{ color: colors.white }}
                            >
                              Dues
                            </StandardText>
                          </View>
                        )}
                        {tenant.is_on_notice && (
                          <View
                            style={[
                              styles.inlineBadge,
                              { backgroundColor: colors.warning },
                            ]}
                          >
                            <StandardText
                              size="xs"
                              fontWeight="bold"
                              style={{ color: colors.white }}
                            >
                              Notice
                            </StandardText>
                          </View>
                        )}
                      </View>

                      {/* Tenant Details */}
                      <View style={styles.tenantMetaRow}>
                        <View style={styles.metaItem}>
                          <MaterialCommunityIcons
                            name="cash"
                            size={14}
                            color={colors.primary}
                          />
                          <StandardText
                            size="sm"
                            style={[styles.metaText, { color: textSecondary }]}
                          >
                            ₹{tenant.room?.rentAmount || 'N/A'}
                          </StandardText>
                        </View>

                        <View style={styles.metaDivider} />

                        <View style={styles.metaItem}>
                          <MaterialCommunityIcons
                            name="calendar-check"
                            size={14}
                            color={colors.primary}
                          />
                          <StandardText
                            size="sm"
                            style={[styles.metaText, { color: textSecondary }]}
                          >
                            {tenant.check_in_date || 'N/A'}
                          </StandardText>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Action Menu Button */}
                  <TouchableOpacity
                    ref={r => {
                      if (r) {
                        anchorRefs.current[tenant.tenant_id] = r;
                      }
                    }}
                    onPress={() => openMenu(tenant.tenant_id)}
                    style={styles.menuButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons
                      name="dots-vertical"
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </View>

          <Gap size="xxl" />
        </View>
      </ScrollView>

      {/* ===== CUSTOM MENU OVERLAY - MOVED OUTSIDE SCROLLVIEW ===== */}
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
                top: menuPosition.y,
                left: menuPosition.x,
                backgroundColor: cardBackground,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                closeMenu();
                navigation.navigate('EditTenant', {
                  tenant_id: activeMenuTenantId,
                });
              }}
            >
              <MaterialCommunityIcons
                name="pencil"
                size={18}
                color={colors.primary}
                style={styles.menuIcon}
              />
              <StandardText style={[styles.menuText, { color: textPrimary }]}>
                Edit
              </StandardText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                putTenantOnNotice(credentials.accessToken, activeMenuTenantId, {
                  notice: true,
                });
                closeMenu();
              }}
            >
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={18}
                color={colors.warning}
                style={styles.menuIcon}
              />
              <StandardText
                style={[styles.menuText, { color: colors.warning }]}
              >
                Put on Notice
              </StandardText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                await deleteTenant(credentials.accessToken, activeMenuTenantId);
                closeMenu();
                const res = await getTenants(
                  credentials.accessToken,
                  property_id,
                  room.room_id,
                );
                setTenants(res.data);
              }}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={18}
                color={colors.error}
                style={styles.menuIcon}
              />
              <StandardText style={[styles.menuText, { color: colors.error }]}>
                Delete
              </StandardText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Image Carousel Styles
  imageCarouselContainer: {
    height: 250,
    marginBottom: 16,
  },
  carouselImage: {
    width: SCREEN_WIDTH,
    height: 250,
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
    textAlign: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: colors.white,
    margin: 4,
    borderRadius: 4,
  },
  // Room Header Styles
  roomHeaderCard: {
    margin: 16,
    borderRadius: 18,
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
  },
  roomHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  roomTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roomTitle: {
    marginLeft: 12,
    fontSize: 20,
  },
  statusChip: {
    borderRadius: 16,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 12,
  },
  // Content Container
  contentContainer: {
    paddingHorizontal: 16,
  },
  // Statistics Cards
  statisticsGrid: {
    gap: 16,
  },
  statisticsCard: {
    borderRadius: 18,
    padding: 18,
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 16,
  },
  cardContent: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 16,
  },
  tenantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tenantName: {
    marginLeft: 8,
    fontSize: 14,
  },
  ticketMessage: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  // Amenities Styles
  amenitiesCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    borderRadius: 20,
    elevation: 1,
  },
  amenityText: {
    fontWeight: '500',
    fontSize: 12,
  },
  // Tenants Section Styles
  tenantsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tenantsSectionTitle: {
    marginLeft: 8,
    fontSize: 18,
  },
  tenantsContainer: {
    gap: SPACING.sm,
  },
  tenantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: PADDING.large,
    borderRadius: RADIUS.medium,
    ...SHADOW.medium,
    shadowColor: colors.primary,
    borderWidth: 1,
    borderColor: 'rgba(238, 123, 17, 0.08)',
  },
  tenantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  tenantRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...SHADOW.light,
  },
  tenantInfo: {
    flex: 1,
  },
  tenantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  inlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  tenantMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.border,
    marginHorizontal: 8,
  },
  emptyTenantsCard: {
    padding: 32,
    borderRadius: RADIUS.medium,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.light,
  },
  emptyText: {
    marginTop: 12,
    textAlign: 'center',
  },
  menuButton: {
    padding: 4,
    borderRadius: 20,
  },
  // Menu Styles
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: 'transparent',
  },
  popup: {
    position: 'absolute',
    minWidth: 160,
    maxWidth: 180,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
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
  menuText: {
    fontSize: 14,
  },
  // Loading and Error Styles
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
  buttonLabel: {
    fontFamily: 'Metropolis-Bold',
    fontSize: 16,
  },
});

export default RoomDetails;
