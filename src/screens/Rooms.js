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
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { Button, Chip, FAB, TextInput as PaperInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../context/ThemeContext';
import { CredentialsContext } from '../context/CredentialsContext';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import Share from 'react-native-share';
import {
  getDocument,
  propertyRooms,
  deleteRoom,
} from '../services/NetworkUtils';
import colors from '../theme/color';
import StandardText from '../components/StandardText/StandardText';

const Rooms = ({ navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials, isAuthenticated } = useContext(CredentialsContext);

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [isAuthenticated, navigation]);

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuCoords, setMenuCoords] = useState({ x: 0, y: 0 });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const iconRefs = useRef({});

  const [filterOptions, setFilterOptions] = useState([
    { label: 'All', key: 'ALL', value: 0 },
    { label: 'Vacant Beds', key: 'VACANT', value: 0 },
    { label: '1 Bed', key: '1', value: 0 },
    { label: '2 Beds', key: '2', value: 0 },
    { label: '3 Beds', key: '3', value: 0 },
    { label: '4 Beds', key: '4', value: 0 },
  ]);

  const accessToken = credentials.accessToken;
  const propertyId = credentials.property_id;

  // 🔹 Fetch rooms
  const fetchRooms = useCallback(async () => {
    if (!accessToken || !propertyId) {
      setError('Missing access token or property ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await propertyRooms(accessToken, propertyId);
      const roomData = response.data.items || [];

      const roomsWithImages = await Promise.all(
        roomData.map(async r => {
          let imageUrl = null;
          if (r.image_document_id_list?.length > 0) {
            try {
              const docId = r.image_document_id_list[0];
              const res = await getDocument(accessToken, propertyId, docId);
              imageUrl = res?.data?.download_url || null;
            } catch (err) {}
          }
          return { ...r, imageUrl };
        }),
      );

      setRooms(roomsWithImages);
      setError(null);

      // Update filter counts
      const allCount = roomsWithImages.length;
      const vacantCount = roomsWithImages.filter(
        r => r.status === 'VACANT',
      ).length;
      const oneBedCount = roomsWithImages.filter(r => r.bedCount === 1).length;
      const twoBedsCount = roomsWithImages.filter(r => r.bedCount === 2).length;
      const threeBedsCount = roomsWithImages.filter(
        r => r.bedCount === 3,
      ).length;
      const fourBedsCount = roomsWithImages.filter(
        r => r.bedCount === 4,
      ).length;

      setFilterOptions([
        { label: 'All', key: 'ALL', value: allCount },
        { label: 'Vacant Beds', key: 'VACANT', value: vacantCount },
        { label: '1 Bed', key: '1', value: oneBedCount },
        { label: '2 Beds', key: '2', value: twoBedsCount },
        { label: '3 Beds', key: '3', value: threeBedsCount },
        { label: '4 Beds', key: '4', value: fourBedsCount },
      ]);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [accessToken, propertyId]);

  useEffect(() => {
    fetchRooms();
    const unsubscribe = navigation.addListener('focus', fetchRooms);
    return unsubscribe;
  }, [navigation, fetchRooms]);

  // 🔹 Filtering
  const filteredRooms = rooms
    .filter(
      room =>
        !search || room.name?.toLowerCase().includes(search.toLowerCase()),
    )
    .filter(room => {
      if (selectedFilter === 'ALL') return true;
      if (selectedFilter === 'VACANT') return room.status === 'VACANT';
      return room.bedCount?.toString() === selectedFilter;
    });

  // 🔹 Share
  const handleShareRoom = async room => {
    try {
      const message =
        `🏠 Room Details\n` +
        `Name: ${room.name || `Room ${room.id}`}\n` +
        `Beds: ${room.bedCount ?? 'N/A'}\n` +
        `Bathrooms: ${room.bathroomCount ?? 'N/A'}\n` +
        `Floor: ${room.floorNumber ?? 'N/A'}\n` +
        `Area Type: ${room.areaType ? room.areaType + ' sqft' : 'N/A'}\n` +
        `Rent: ₹${room.rentAmount ?? 'N/A'}\n` +
        (room.amenities ? `Amenities: ${room.amenities}\n` : '') +
        (room.description ? `Description: ${room.description}\n` : '');

      await Share.open({
        title: 'Share Room',
        message,
        url: room.imageUrl || undefined,
      });
    } catch (err) {}
  };

  // 🔹 Open menu
  const openMenu = (room, id) => {
    iconRefs.current[id]?.measureInWindow((x, y, width, height) => {
      setMenuCoords({ x, y: y + height });
      setSelectedRoom(room);
      setMenuVisible(true);
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background, marginTop: 25 }}
    >
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Search */}
          <PaperInput
            mode="flat"
            placeholder="Search Rooms..."
            value={search}
            onChangeText={setSearch}
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

          <Gap size="md" />

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterContainer}
          >
            {filterOptions.map(option => (
              <Chip
                key={option.key}
                selected={selectedFilter === option.key}
                onPress={() => setSelectedFilter(option.key)}
                style={[
                  styles.chip,
                  selectedFilter === option.key && {
                    backgroundColor: colors.primary,
                  },
                ]}
                textStyle={{
                  color: selectedFilter === option.key ? '#fff' : '#000',
                  fontFamily: 'Metropolis-Medium',
                }}
              >
                {option.label} ({option.value})
              </Chip>
            ))}
          </ScrollView>

          {/* Loader / Error / Empty */}
          {loading && (
            <StandardText style={{ textAlign: 'center' }}>
              Loading rooms...
            </StandardText>
          )}
          {error && (
            <View style={{ alignItems: 'center' }}>
              <StandardText style={{ color: 'red' }}>{error}</StandardText>
              <Button
                mode="contained"
                onPress={fetchRooms}
                style={{ marginTop: 10 }}
              >
                Retry
              </Button>
            </View>
          )}
          {!loading && !error && filteredRooms.length === 0 && (
            <StandardText style={{ textAlign: 'center' }}>
              No rooms found
            </StandardText>
          )}

          {/* Rooms */}
          {!loading &&
            filteredRooms.map(room => (
              <StandardCard key={room.id} style={styles.card}>
                <TouchableOpacity
                  onPress={() => navigation.navigate('RoomDetails', { room })}
                >
                  {/* Image */}
                  {room.imageUrl ? (
                    <Image
                      source={{ uri: room.imageUrl }}
                      style={{ width: '100%', height: 150 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <MaterialCommunityIcons
                        name="image-off"
                        size={40}
                        color="#aaa"
                      />
                    </View>
                  )}

                  {/* Content */}
                  <View style={{ padding: 12 }}>
                    <View style={styles.titleRow}>
                      <StandardText fontWeight="bold" style={styles.roomTitle}>
                        {room.name || `Room ${room.id}`}
                      </StandardText>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor:
                              room.status === 'VACANT' ? '#DFF5E1' : '#FFE2E2',
                          },
                        ]}
                      >
                        <StandardText
                          style={{
                            color:
                              room.status === 'VACANT' ? '#219653' : '#D9534F',
                          }}
                        >
                          {room.status}
                        </StandardText>
                      </View>

                      {/* Custom Menu Trigger */}
                      <TouchableOpacity
                        ref={ref => (iconRefs.current[room.id] = ref)}
                        onPress={() => openMenu(room, room.id)}
                      >
                        <MaterialCommunityIcons
                          name="dots-vertical"
                          size={22}
                          color="#555"
                        />
                      </TouchableOpacity>
                    </View>

                    <StandardText style={{ marginTop: 4 }}>
                      Rent:{' '}
                      <StandardText
                        fontWeight="bold"
                        style={{ color: colors.primary }}
                      >
                        ₹{room.rentAmount}
                      </StandardText>
                    </StandardText>

                    <View style={styles.infoRow}>
                      <View style={styles.infoItem}>
                        <MaterialCommunityIcons
                          name="bed"
                          size={18}
                          color="#666"
                        />
                        <StandardText style={styles.infoText}>
                          {room.bedCount} Beds
                        </StandardText>
                      </View>
                      <View style={styles.infoItem}>
                        <MaterialCommunityIcons
                          name="shower"
                          size={18}
                          color="#666"
                        />
                        <StandardText style={styles.infoText}>
                          {room.bathroomCount} Baths
                        </StandardText>
                      </View>
                      <View style={styles.infoItem}>
                        <MaterialCommunityIcons
                          name="stairs"
                          size={18}
                          color="#666"
                        />
                        <StandardText style={styles.infoText}>
                          Floor {room.floorNumber}
                        </StandardText>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </StandardCard>
            ))}
        </ScrollView>

        {/* FAB */}
        <FAB
          icon="plus"
          color="#fff"
          style={styles.fab}
          onPress={() => navigation.navigate('AddRoom')}
        />

        {/* Popup Menu */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMenuVisible(false)}
          >
            <View
              style={[
                styles.menuContainer,
                { top: menuCoords.y, left: menuCoords.x - 150 }, // shift left
              ]}
            >
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('AddRoom', {
                    room: selectedRoom,
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
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  handleShareRoom(selectedRoom);
                }}
              >
                <MaterialCommunityIcons
                  name="share"
                  size={18}
                  color="#555"
                  style={{ marginRight: 10 }}
                />
                <StandardText>Share</StandardText>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  // Add your message handling
                }}
              >
                <MaterialCommunityIcons
                  name="message"
                  size={18}
                  color="#555"
                  style={{ marginRight: 10 }}
                />
                <StandardText>Send Message</StandardText>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={async () => {
                  setMenuVisible(false);
                  await deleteRoom(accessToken, propertyId, selectedRoom.id);
                  fetchRooms();
                }}
              >
                <MaterialCommunityIcons
                  name="trash-can"
                  size={18}
                  color="#555"
                  style={{ marginRight: 10, color: 'red' }}
                />
                <StandardText style={{ color: 'red' }}>Delete</StandardText>
              </Pressable>
            </View>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  filterContainer: { flexDirection: 'row', marginBottom: 16 },
  searchBar: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 2,
  },
  card: { marginTop: 14, borderRadius: 16, overflow: 'hidden', elevation: 3 },
  imagePlaceholder: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomTitle: { fontSize: 16, color: '#333' },
  statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  infoItem: { flexDirection: 'row', alignItems: 'center' },
  infoText: { marginLeft: 4, fontSize: 13, color: '#555' },
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 30,
    borderRadius: 30,
    backgroundColor: colors.primary,
  },
  chip: { marginRight: 10, borderRadius: 20, elevation: 1 },
  menuContainer: {
    position: 'absolute',
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  menuItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default Rooms;
