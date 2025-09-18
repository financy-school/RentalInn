import React, { useState, useContext } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { TextInput as PaperInput, useTheme } from 'react-native-paper';
import { ThemeContext } from '../context/ThemeContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import GradientCard from '../components/GradientCard/GradientCard';
import StyledTextInput from '../components/StyledTextInput/StyledTextInput';
import SimpleAccordion from '../components/SimpleAccordion/SimpleAccordion';
import Gap from '../components/Gap/Gap';

const FAQ = ({ navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  const faqData = [
    {
      category: '🏠 Room Management',
      icon: 'home',
      questions: [
        {
          question: 'How do I add a new room?',
          answer:
            'Navigate to Property Management > Add New Room from the drawer menu. Fill in all required details including room name, area type (BHK/RK), floor number, bed count, bathroom count, rent amount, security deposit, and electricity reading details. You can also upload up to 10 images of the room.',
        },
        {
          question: 'Can I edit room details after creation?',
          answer:
            'Yes! Go to All Rooms, find your room, and tap on it to view details. Then tap the edit icon to modify room information, update images, or change availability status.',
        },
        {
          question: 'How do I mark a room as occupied or available?',
          answer:
            'When editing a room, you can toggle the "Available" status. Set it to "No" when the room is occupied and "Yes" when it becomes available for new tenants.',
        },
        {
          question: 'What should I include in room amenities?',
          answer:
            'List all facilities available in the room such as AC, WiFi, Geyser, Furniture, Parking, etc. Separate multiple amenities with commas for better organization.',
        },
        {
          question: 'How do I track electricity readings?',
          answer:
            'Each room requires a last electricity reading and date. This helps in calculating electricity bills for tenants and maintaining accurate utility records.',
        },
      ],
    },
    {
      category: '👥 Tenant Management',
      icon: 'people',
      questions: [
        {
          question: 'How do I add a new tenant?',
          answer:
            'Go to Tenant Management > Add New Tenant. Fill in personal details (name, phone, email), room assignment, check-in/check-out dates, agreement terms, and rent start date. All dates can be selected using the calendar picker.',
        },
        {
          question:
            'What is the difference between lock-in period and agreement period?',
          answer:
            'Lock-in period is the minimum time a tenant must stay (e.g., 6 months) during which they cannot vacate without penalty. Agreement period is the total duration of the rental contract (e.g., 12 months).',
        },
        {
          question: 'Can I have both family and bachelor tenants?',
          answer:
            'Yes! When adding a tenant, you can specify the tenant type as either "Family" or "Bachelors" to help organize and manage different tenant categories.',
        },
        {
          question: 'How do I handle tenant check-out?',
          answer:
            'Edit the tenant details and update the check-out date. You can also update the room status to "Available" once the tenant vacates.',
        },
        {
          question: 'What happens if I enter wrong tenant information?',
          answer:
            'You can edit tenant details anytime by going to All Tenants, selecting the tenant, and using the edit option to update any information.',
        },
      ],
    },
    {
      category: '🎫 Support & Maintenance',
      icon: 'construct',
      questions: [
        {
          question: 'How do I create a support ticket?',
          answer:
            'Navigate to Support & Maintenance > Create Ticket. Enter the issue title, detailed description, reporter name, and room ID. You can also attach up to 5 photos as evidence to help resolve the issue faster.',
        },
        {
          question: 'What types of issues can I report?',
          answer:
            'You can report any maintenance issues like plumbing problems, electrical faults, appliance malfunctions, cleanliness concerns, security issues, or any other property-related problems.',
        },
        {
          question: 'How do I track ticket status?',
          answer:
            'Go to All Tickets to view all your support requests. Each ticket shows its current status (Pending, In Progress, Resolved) and you can tap on it for detailed information.',
        },
        {
          question: 'Can I add photos to support tickets?',
          answer:
            'Yes! When creating a ticket, you can upload up to 5 photos to provide visual evidence of the issue. This helps maintenance teams understand and resolve problems more efficiently.',
        },
        {
          question: 'Who can raise a support ticket?',
          answer:
            'Both property owners and tenants can raise support tickets. Make sure to specify who is reporting the issue in the "Raised By" field.',
        },
      ],
    },
    {
      category: '💰 Payments & Finance',
      icon: 'cash',
      questions: [
        {
          question: 'How do I track rental payments?',
          answer:
            'Use the Payments section to monitor all rental transactions. You can view payment history, pending amounts, and generate financial reports for better money management.',
        },
        {
          question: 'What is security deposit and how much should I charge?',
          answer:
            'Security deposit is a refundable amount collected from tenants as protection against damages or unpaid dues. Typically, it ranges from 1-3 months of rent depending on local practices and property value.',
        },
        {
          question: 'Can I generate financial reports?',
          answer:
            'Yes! Go to Financial Reports to access Revenue Overview, Expense Tracking, and Payment History. These reports help you analyze property performance and manage finances effectively.',
        },
        {
          question: 'How do I handle late payment fees?',
          answer:
            'You can track late payments through the payment history and add any penalties or late fees as additional charges in the expense tracking section.',
        },
      ],
    },
    {
      category: '📋 KYC & Documentation',
      icon: 'document-text',
      questions: [
        {
          question: 'What documents should I collect from tenants?',
          answer:
            'Collect government ID proof (Aadhar, PAN, Passport), address proof, employment verification, previous landlord reference, passport-size photos, and emergency contact details.',
        },
        {
          question: 'How do I store tenant documents securely?',
          answer:
            'Use the KYC Documents section to upload and organize all tenant paperwork. Store documents in digital format for easy access and better security.',
        },
        {
          question: 'Is it mandatory to verify tenant background?',
          answer:
            "While not legally mandatory everywhere, it's highly recommended to verify tenant identity, employment, and references to ensure reliable tenancy and protect your property.",
        },
        {
          question: 'What should be included in the rental agreement?',
          answer:
            'Include tenant details, property description, rent amount, security deposit, lease duration, rules and regulations, maintenance responsibilities, and termination conditions.',
        },
      ],
    },
    {
      category: '📱 App Usage',
      icon: 'phone-portrait',
      questions: [
        {
          question: 'How do I navigate between different sections?',
          answer:
            'Use the drawer menu (hamburger icon) to access all sections like Dashboard, Room Management, Tenant Management, Support & Maintenance, and Financial Reports.',
        },
        {
          question: 'Can I use the app offline?',
          answer:
            'Some features work offline, but for real-time data sync and cloud storage, an internet connection is required. Offline changes will sync when you reconnect.',
        },
        {
          question: 'How do I change app theme?',
          answer:
            "Go to Settings to switch between light and dark themes. The app automatically adapts to your device's system theme preferences.",
        },
        {
          question: 'What should I do if the app crashes?',
          answer:
            'First, try restarting the app. If the problem persists, check for app updates, restart your device, or contact support with details about when the crash occurred.',
        },
        {
          question: 'How do I backup my data?',
          answer:
            "Your data is automatically synced to the cloud when you're online. You can also export reports and data from the Financial Reports section for additional backup.",
        },
      ],
    },
    {
      category: '🔒 Security & Privacy',
      icon: 'shield-checkmark',
      questions: [
        {
          question: 'Is my data secure on RentalInn?',
          answer:
            'Yes! We use industry-standard encryption to protect your data. All information is securely stored and transmitted using advanced security protocols.',
        },
        {
          question: 'Who can access my property information?',
          answer:
            "Only you have access to your property data. We don't share your information with third parties without your explicit consent.",
        },
        {
          question: 'How do I change my password?',
          answer:
            'Go to Settings > Account Security to change your password. Use a strong password with a mix of uppercase, lowercase, numbers, and special characters.',
        },
        {
          question: 'Can I enable two-factor authentication?',
          answer:
            'Yes! Enable 2FA in Settings for additional security. This adds an extra layer of protection to your account.',
        },
      ],
    },
  ];

  const filteredFAQs = faqData
    .map(category => ({
      ...category,
      questions: category.questions.filter(
        q =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          category.category.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter(category => category.questions.length > 0);

  const toggleCategory = index => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    scrollContainer: {
      padding: 16,
      backgroundColor: theme.colors.surface,
    },
    headerContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    gradientTitle: {
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 25,
      alignItems: 'center',
    },
    searchContainer: {
      marginBottom: 20,
    },
    categoryCard: {
      marginBottom: 12,
    },
    categoryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    categoryTitleContainer: {
      flex: 1,
    },
    categoryTitle: {
      color: theme.colors.primary,
      marginBottom: 4,
    },
    categoryCount: {
      color: theme.colors.onSurfaceVariant,
    },
    expandIcon: {
      color: theme.colors.primary,
    },
    questionsContainer: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    questionCard: {
      backgroundColor: mode === 'dark' ? '#2a2a2a' : '#f8f9fa',
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
    },
    questionHeader: {
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    questionText: {
      flex: 1,
      color: theme.colors.onSurface,
    },
    answerContainer: {
      padding: 16,
      paddingTop: 0,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline,
    },
    answerText: {
      lineHeight: 22,
      color: theme.colors.onSurfaceVariant,
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 16,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 24,
    },
    statCard: {
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: mode === 'dark' ? '#2a2a2a' : '#f0f0f0',
      minWidth: 100,
    },
    statNumber: {
      color: theme.colors.primary,
      marginBottom: 4,
    },
    statLabel: {
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
    },
    accordionTitle: {
      fontWeight: '600',
    },
  });

  const totalQuestions = faqData.reduce(
    (sum, category) => sum + category.questions.length,
    0,
  );
  const totalCategories = faqData.length;

  return (
    <View style={styles.container}>
      <StandardHeader navigation={navigation} title="FAQ" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <StandardText size="xl" fontWeight="bold" style={styles.statNumber}>
              {totalQuestions}
            </StandardText>
            <StandardText size="sm" style={styles.statLabel}>
              Total Questions
            </StandardText>
          </View>
          <View style={styles.statCard}>
            <StandardText size="xl" fontWeight="bold" style={styles.statNumber}>
              {totalCategories}
            </StandardText>
            <StandardText size="sm" style={styles.statLabel}>
              Categories
            </StandardText>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <StyledTextInput
            label="Search FAQs"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search questions, answers, or categories..."
            left={<PaperInput.Icon icon="magnify" />}
          />
        </View>

        {/* FAQ Categories */}
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((category, categoryIndex) => (
            <GradientCard key={categoryIndex} style={styles.categoryCard}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(categoryIndex)}
              >
                <View style={styles.categoryTitleContainer}>
                  <StandardText
                    size="lg"
                    fontWeight="600"
                    style={styles.categoryTitle}
                  >
                    {category.category}
                  </StandardText>
                  <StandardText size="sm" style={styles.categoryCount}>
                    {category.questions.length} question
                    {category.questions.length !== 1 ? 's' : ''}
                  </StandardText>
                </View>
                <StandardText size="lg" style={styles.expandIcon}>
                  {expandedCategory === categoryIndex ? '−' : '+'}
                </StandardText>
              </TouchableOpacity>

              {expandedCategory === categoryIndex && (
                <View style={styles.questionsContainer}>
                  {category.questions.map((qa, questionIndex) => (
                    <SimpleAccordion
                      key={questionIndex}
                      title={qa.question}
                      titleStyle={styles.accordionTitle}
                      expandedBackgroundColor={
                        mode === 'dark' ? '#1a1a1a' : '#ffffff'
                      }
                    >
                      <StandardText style={styles.answerText}>
                        {qa.answer}
                      </StandardText>
                    </SimpleAccordion>
                  ))}
                </View>
              )}
            </GradientCard>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <StandardText size="xl">🔍</StandardText>
            <StandardText size="lg" fontWeight="600" style={styles.emptyText}>
              No results found
            </StandardText>
            <StandardText style={styles.emptyText}>
              Try adjusting your search terms or browse through categories
            </StandardText>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default FAQ;
