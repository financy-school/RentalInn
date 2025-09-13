import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Button, FAB, Chip } from 'react-native-paper';
import { TextInput as PaperInput } from 'react-native-paper';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import {
  fetchTickets,
  getDocument,
  updateTicket,
} from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';
import colors from '../theme/color';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tickets = ({ navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketImages, setTicketImages] = useState({}); // { ticketId: [urls] }

  const [filterOptions, setFilterOptions] = useState([
    { label: 'All', key: 'ALL', value: 0 },
    { label: 'Active', key: 'ACTIVE', value: 0 },
    { label: 'Closed', key: 'CLOSED', value: 0 },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState(null);

  /** --- Fetch tickets & images --- */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchTickets(
        credentials.accessToken,
        credentials.property_id,
      );

      const items = response?.data?.items || [];
      setAllTickets(items); // ✅ store all tickets
      applyFilter(selectedFilter, items); // filter immediately

      // Calculate counts
      const allCount = items.length;
      const activeCount = items.filter(
        t => t.status === 'PENDING' || t.status === 'ACTIVE',
      ).length;
      const closedCount = items.filter(t => t.status === 'CLOSED').length;

      setFilterOptions([
        { label: 'All', key: 'ALL', value: allCount },
        { label: 'Active', key: 'ACTIVE', value: activeCount },
        { label: 'Closed', key: 'CLOSED', value: closedCount },
      ]);

      // Fetch image URLs for tickets
      const imagesMap = {};
      for (const ticket of items) {
        if (Array.isArray(ticket.image_document_id_list)) {
          const urls = [];
          for (const docId of ticket.image_document_id_list) {
            try {
              const docRes = await getDocument(
                credentials.accessToken,
                credentials.property_id,
                docId,
              );
              if (docRes?.data?.download_url) {
                urls.push(docRes.data.download_url);
              }
            } catch (err) {}
          }
          imagesMap[ticket.id] = urls;
        }
      }
      setTicketImages(imagesMap);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setAllTickets([]);
      setTickets([]);
      setFilterOptions([
        { label: 'All', key: 'ALL', value: 0 },
        { label: 'Active', key: 'ACTIVE', value: 0 },
        { label: 'Closed', key: 'CLOSED', value: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  }, [credentials, selectedFilter, applyFilter]);

  /** --- Apply Filters --- */
  const applyFilter = useCallback(
    (filterKey, sourceTickets = allTickets) => {
      let filtered = sourceTickets;

      if (filterKey === 'ACTIVE') {
        filtered = sourceTickets.filter(
          t => t.status === 'PENDING' || t.status === 'ACTIVE',
        );
      } else if (filterKey === 'CLOSED') {
        filtered = sourceTickets.filter(t => t.status === 'CLOSED');
      }

      // Search filter
      if (search.trim()) {
        const lower = search.toLowerCase();
        filtered = filtered.filter(
          t =>
            t.id.toString().toLowerCase().includes(lower) ||
            t.issue?.toLowerCase().includes(lower) ||
            t.description?.toLowerCase().includes(lower) ||
            t.raisedBy?.toLowerCase().includes(lower),
        );
      }

      setTickets(filtered);
    },
    [search, allTickets],
  );

  /** --- Re-apply filter when search changes --- */
  useEffect(() => {
    applyFilter(selectedFilter);
  }, [search, selectedFilter, allTickets, applyFilter]);

  useEffect(() => {
    applyFilter(selectedFilter);
  }, [search, selectedFilter, allTickets, applyFilter]);

  /** --- Fetch on mount + navigation focus --- */
  useEffect(() => {
    fetchData();
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation, fetchData]);

  /** --- Close Ticket Handler --- */
  const handleCloseTicket = async ticketId => {
    try {
      await updateTicket(credentials.accessToken, ticketId, {
        status: 'CLOSED',
      });
      fetchData(); // ✅ Refresh tickets
    } catch (err) {}
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Image Modal */}
        {modalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedImageUrl(null);
                }}
              >
                <StandardText style={{ color: '#fff' }}>Close</StandardText>
              </TouchableOpacity>
              {selectedImageUrl && (
                <View style={styles.modalImageWrapper}>
                  <Image
                    source={{ uri: selectedImageUrl }}
                    style={styles.modalRectImage}
                  />
                </View>
              )}
            </View>
          </View>
        )}
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Search Bar */}
          <PaperInput
            mode="flat"
            placeholder="Search Tickets..."
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
                fontFamily: 'Metropolis-Medium',
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

          {/* Loading Indicator or Ticket List */}
          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <StandardText>Loading tickets...</StandardText>
            </View>
          ) : (
            <>
              {/* Ticket List */}
              {tickets.map(ticket => (
                <StandardCard
                  style={styles.card}
                  id={ticket.id}
                  key={ticket.id}
                >
                  {/* Header */}
                  <View style={styles.header}>
                    <StandardText fontWeight="semibold" style={styles.ticketId}>
                      #{ticket.id}
                    </StandardText>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            ticket.status === 'PENDING'
                              ? '#ff9800'
                              : ticket.status === 'ACTIVE'
                              ? '#4caf50'
                              : '#9e9e9e',
                        },
                      ]}
                    >
                      <StandardText
                        fontWeight="semibold"
                        size="sm"
                        style={{ color: '#fff' }}
                      >
                        {ticket.status}
                      </StandardText>
                    </View>
                  </View>

                  {/* Raised By + Room */}
                  <View style={styles.infoRow}>
                    <StandardText
                      size="sm"
                      fontWeight="semibold"
                      color="default_gray"
                    >
                      👤 {ticket.raisedBy}
                    </StandardText>
                    <StandardText size="sm" color="default_gray">
                      🏠 Room {ticket.roomId}
                    </StandardText>
                  </View>

                  {/* Time */}
                  <StandardText
                    size="xs"
                    color="default_gray"
                    style={styles.timeText}
                  >
                    {new Date(ticket.createdAt).toLocaleString()}
                  </StandardText>

                  {/* Images */}
                  {ticketImages[ticket.id] &&
                    ticketImages[ticket.id].length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.imageScroll}
                      >
                        {ticketImages[ticket.id].map((imgUrl, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={{ marginRight: 8 }}
                            onPress={() => {
                              setSelectedImageUrl(imgUrl);
                              setModalVisible(true);
                            }}
                          >
                            <Image
                              key={idx}
                              source={{ uri: imgUrl }}
                              style={styles.image}
                            />
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}

                  {/* Issue + Description */}
                  <View style={{ marginTop: 6 }}>
                    <StandardText fontWeight="semibold" style={styles.issue}>
                      {ticket.issue}
                    </StandardText>
                    {ticket.description ? (
                      <StandardText
                        size="sm"
                        color="default_gray"
                        numberOfLines={3}
                        style={styles.description}
                      >
                        {ticket.description}
                      </StandardText>
                    ) : null}
                  </View>

                  {/* Close Button */}
                  {ticket.status === 'PENDING' && (
                    <View style={styles.actionRow}>
                      <Button
                        mode="contained"
                        style={styles.actionButton}
                        onPress={() => handleCloseTicket(ticket.id)}
                      >
                        <StandardText style={{ color: '#fff' }}>
                          Close Ticket
                        </StandardText>
                      </Button>
                    </View>
                  )}
                </StandardCard>
              ))}
              <Gap size="xl" />
              <Gap size="xl" />
            </>
          )}
        </ScrollView>

        {/* FAB */}
        <FAB
          icon="plus"
          color="#fff"
          style={styles.fab}
          onPress={() => navigation.navigate('AddTicket')}
        />
      </View>
    </SafeAreaView>
  );
};

/** --- Styles --- */
const styles = StyleSheet.create({
  modalRectImage: {
    width: 300,
    height: 300,
    borderRadius: 20,
    backgroundColor: '#fff',
    resizeMode: 'cover',
  },
  rectImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#fff',
    resizeMode: 'cover',
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 25,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterBox: {
    paddingVertical: 10,

    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    width: 80,
  },
  searchBar: {
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 25,
    elevation: 2,
    fontFamily: 'Metropolis-Medium',
  },
  textWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
    width: '70%',
    alignSelf: 'center',
  },
  closeButtonWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 120,
    right: 30,
    borderRadius: 30,
    backgroundColor: colors.primary,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: 'transparent',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImageWrapper: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
  },
  card: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketId: {
    fontSize: 16,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  row: {
    flexDirection: 'row',
    marginTop: 6,
  },
  raisedBy: {
    marginLeft: 4,
    color: '#2196f3',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  timeText: {
    marginTop: 2,
    fontStyle: 'italic',
  },
  imageScroll: {
    marginVertical: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 14,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  issue: {
    fontSize: 15,
    marginBottom: 2,
    color: '#222',
  },
  description: {
    marginTop: 2,
    lineHeight: 18,
  },
  actionRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    borderRadius: 25,
    backgroundColor: '#1976d2',
    paddingHorizontal: 20,
    elevation: 2,
  },
  chip: { marginRight: 10, borderRadius: 20, elevation: 1 },
});

import withAuthProtection from '../components/withAuthProtection';

export default withAuthProtection(Tickets);
