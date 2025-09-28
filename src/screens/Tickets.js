import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Button, FAB, Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { TextInput as PaperInput } from 'react-native-paper';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardCard from '../components/StandardCard/StandardCard';
import Gap from '../components/Gap/Gap';
import PropertySelector from '../components/PropertySelector/PropertySelector';
import SelectPropertyPrompt from '../components/SelectPropertyPrompt/SelectPropertyPrompt';
import {
  fetchTickets,
  getDocument,
  updateTicket,
} from '../services/NetworkUtils';
import { CredentialsContext } from '../context/CredentialsContext';
import { useProperty } from '../context/PropertyContext';
import colors from '../theme/color';

const Tickets = ({ navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { credentials } = useContext(CredentialsContext);
  const { selectedProperty, isAllPropertiesSelected } = useProperty();

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
      // Use selectedProperty from PropertyContext if specific property is selected,
      // otherwise don't fetch tickets when "All" is selected (tickets are property-specific)
      // const currentPropertyId = !isAllPropertiesSelected
      //   ? selectedProperty?.property_id
      //   : null;

      const currentPropertyId = selectedProperty?.property_id;

      if (!currentPropertyId) {
        // Don't show error when no property is selected - just clear data
        setAllTickets([]);
        setTickets([]);
        setLoading(false);
        return;
      }

      const response = await fetchTickets(
        credentials.accessToken,
        currentPropertyId,
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
                currentPropertyId,
                docId,
              );
              if (docRes?.data?.download_url) {
                urls.push(docRes.data.download_url);
              }
            } catch (err) {}
          }
          imagesMap[ticket.ticket_id] = urls;
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
  }, [credentials, selectedFilter, applyFilter, selectedProperty]);

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
            t.ticket_id.toString().toLowerCase().includes(lower) ||
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
    <View style={styles.container}>
      {/* Property Selector */}
      <View style={styles.propertySelectorContainer}>
        <PropertySelector
          navigation={navigation}
          requireSpecificProperty={false}
          actionContext="manage-tickets"
        />
      </View>

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
      <ScrollView>
        {/* Show SelectPropertyPrompt if no property is selected */}
        {/* {isAllPropertiesSelected ? (
          <SelectPropertyPrompt
            title="Select a Property"
            description="Please select a specific property to view and manage tickets. Tickets are organized by property."
            onSelectProperty={() => {
              // Scroll to top to show PropertySelector
            }}
          />
        ) : ( */}
        <>
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
              {/* Empty State */}
              {tickets.length === 0 && (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="clipboard-text-outline"
                    size={80}
                    color={colors.primary}
                    style={styles.emptyIcon}
                  />
                  <StandardText style={styles.emptyText}>
                    No tickets found
                  </StandardText>
                  <StandardText style={styles.emptySubtext}>
                    Create your first maintenance ticket to track property
                    issues
                  </StandardText>
                </View>
              )}

              {/* Ticket List */}
              {tickets.map(ticket => (
                <StandardCard
                  style={styles.card}
                  id={ticket.ticket_id}
                  key={ticket.ticket_id}
                >
                  {/* Header */}
                  <View style={styles.header}>
                    <StandardText fontWeight="semibold" style={styles.ticketId}>
                      #{ticket.ticket_id}
                    </StandardText>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            ticket.status === 'PENDING'
                              ? 'rgba(255, 152, 0, 0.2)'
                              : ticket.status === 'ACTIVE'
                              ? 'rgba(76, 175, 80, 0.2)'
                              : 'rgba(158, 158, 158, 0.2)',
                        },
                      ]}
                    >
                      <StandardText
                        fontWeight="semibold"
                        size="sm"
                        style={{ color: colors.primary }}
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
                      🏠 Room {ticket.room_id}
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
                  {ticketImages[ticket.ticket_id] &&
                    ticketImages[ticket.ticket_id].length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.imageScroll}
                      >
                        {ticketImages[ticket.ticket_id].map((imgUrl, idx) => (
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
                        onPress={() => handleCloseTicket(ticket.ticket_id)}
                      >
                        <StandardText
                          fontWeight="semibold"
                          style={{ color: '#fff' }}
                        >
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
        </>
        {/* )} */}
      </ScrollView>

      {/* FAB */}
      <FAB
        icon="plus"
        color="#fff"
        style={styles.fab}
        onPress={() => navigation.navigate('AddTicket')}
      />
    </View>
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
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },
  propertySelectorContainer: {
    marginBottom: 16,
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
    backgroundColor: colors.secondary,
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
    borderRadius: 5,
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
    borderRadius: 5,
    backgroundColor: colors.secondary,
    paddingHorizontal: 5,
    elevation: 2,
  },
  chip: { marginRight: 10, borderRadius: 20, elevation: 1 },
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
import { color } from 'react-native-elements/dist/helpers';

export default withAuthProtection(Tickets);
