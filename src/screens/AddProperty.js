import React, { useContext, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { ThemeContext } from '../context/ThemeContext';
import { useProperty } from '../context/PropertyContext';
import StandardText from '../components/StandardText/StandardText';
import StandardHeader from '../components/StandardHeader/StandardHeader';
import StyledTextInput from '../components/StyledTextInput/StyledTextInput';
import Gap from '../components/Gap/Gap';
import SearchableDropdown from '../components/SearchableDropdown/SearchableDropdown';
import colors from '../theme/color';

// Comprehensive Indian States and Cities Data
const INDIAN_STATES_DATA = [
  {
    label: 'Andhra Pradesh',
    value: 'Andhra Pradesh',
    cities: [
      'Visakhapatnam',
      'Vijayawada',
      'Guntur',
      'Nellore',
      'Kurnool',
      'Rajahmundry',
      'Tirupati',
      'Kadapa',
      'Anantapur',
      'Chittoor',
      'Vizianagaram',
      'Eluru',
      'Ongole',
      'Nandyal',
      'Machilipatnam',
      'Adoni',
      'Tenali',
      'Proddatur',
      'Hindupur',
      'Bhimavaram',
      'Madanapalle',
      'Guntakal',
      'Dharmavaram',
      'Gudivada',
      'Narasaraopet',
      'Tadipatri',
      'Mangalagiri',
      'Chilakaluripet',
    ],
  },
  {
    label: 'Arunachal Pradesh',
    value: 'Arunachal Pradesh',
    cities: [
      'Itanagar',
      'Naharlagun',
      'Pasighat',
      'Tezpur',
      'Bomdila',
      'Ziro',
      'Along',
      'Tezu',
      'Changlang',
      'Khonsa',
    ],
  },
  {
    label: 'Assam',
    value: 'Assam',
    cities: [
      'Guwahati',
      'Silchar',
      'Dibrugarh',
      'Jorhat',
      'Nagaon',
      'Tinsukia',
      'Tezpur',
      'Bongaigaon',
      'Dhubri',
      'Diphu',
      'North Lakhimpur',
      'Karimganj',
      'Sivasagar',
      'Goalpara',
      'Barpeta',
      'Mangaldoi',
      'Haflong',
      'Hailakandi',
    ],
  },
  {
    label: 'Bihar',
    value: 'Bihar',
    cities: [
      'Patna',
      'Gaya',
      'Bhagalpur',
      'Muzaffarpur',
      'Darbhanga',
      'Bihar Sharif',
      'Arrah',
      'Begusarai',
      'Katihar',
      'Munger',
      'Chhapra',
      'Danapur',
      'Saharsa',
      'Hajipur',
      'Sasaram',
      'Dehri',
      'Siwan',
      'Motihari',
      'Nawada',
      'Bagaha',
      'Buxar',
      'Kishanganj',
      'Sitamarhi',
      'Jamalpur',
      'Jehanabad',
      'Aurangabad',
    ],
  },
  {
    label: 'Chhattisgarh',
    value: 'Chhattisgarh',
    cities: [
      'Raipur',
      'Bhilai',
      'Korba',
      'Bilaspur',
      'Durg',
      'Rajnandgaon',
      'Jagdalpur',
      'Raigarh',
      'Ambikapur',
      'Mahasamund',
      'Dhamtari',
      'Chirmiri',
      'Janjgir',
      'Sakti',
      'Tilda Newra',
      'Mungeli',
      'Manendragarh',
      'Naila Janjgir',
    ],
  },
  {
    label: 'Delhi',
    value: 'Delhi',
    cities: [
      'New Delhi',
      'Central Delhi',
      'North Delhi',
      'South Delhi',
      'East Delhi',
      'West Delhi',
      'North East Delhi',
      'North West Delhi',
      'South East Delhi',
      'South West Delhi',
      'Shahdara',
      'Delhi Cantonment',
    ],
  },
  {
    label: 'Goa',
    value: 'Goa',
    cities: [
      'Panaji',
      'Margao',
      'Vasco da Gama',
      'Mapusa',
      'Ponda',
      'Bicholim',
      'Curchorem',
      'Sanquelim',
    ],
  },
  {
    label: 'Gujarat',
    value: 'Gujarat',
    cities: [
      'Ahmedabad',
      'Surat',
      'Vadodara',
      'Rajkot',
      'Bhavnagar',
      'Jamnagar',
      'Junagadh',
      'Gandhinagar',
      'Anand',
      'Morbi',
      'Nadiad',
      'Bharuch',
      'Mehsana',
      'Bhuj',
      'Porbandar',
      'Palanpur',
      'Valsad',
      'Vapi',
      'Gondal',
      'Veraval',
      'Godhra',
      'Patan',
      'Kalol',
      'Dahod',
      'Botad',
      'Amreli',
      'Deesa',
      'Jetpur',
    ],
  },
  {
    label: 'Haryana',
    value: 'Haryana',
    cities: [
      'Gurugram',
      'Faridabad',
      'Panipat',
      'Ambala',
      'Yamunanagar',
      'Rohtak',
      'Hisar',
      'Karnal',
      'Sonipat',
      'Panchkula',
      'Bhiwani',
      'Sirsa',
      'Bahadurgarh',
      'Jind',
      'Thanesar',
      'Kaithal',
      'Rewari',
      'Narnaul',
      'Pundri',
      'Kosli',
      'Palwal',
      'Hansi',
      'Maham',
      'Assandh',
    ],
  },
  {
    label: 'Himachal Pradesh',
    value: 'Himachal Pradesh',
    cities: [
      'Shimla',
      'Dharamshala',
      'Solan',
      'Mandi',
      'Palampur',
      'Una',
      'Kullu',
      'Hamirpur',
      'Bilaspur',
      'Chamba',
      'Kangra',
      'Sundernagar',
      'Jogindernagar',
      'Nurpur',
      'Manali',
      'Keylong',
      'Reckong Peo',
    ],
  },
  {
    label: 'Jharkhand',
    value: 'Jharkhand',
    cities: [
      'Ranchi',
      'Jamshedpur',
      'Dhanbad',
      'Bokaro',
      'Deoghar',
      'Phusro',
      'Hazaribagh',
      'Giridih',
      'Ramgarh',
      'Medininagar',
      'Chirkunda',
      'Saunda',
      'Chaibasa',
      'Gumla',
      'Dumka',
      'Godda',
      'Sahebganj',
      'Koderma',
    ],
  },
  {
    label: 'Karnataka',
    value: 'Karnataka',
    cities: [
      'Bangalore',
      'Mysore',
      'Hubli-Dharwad',
      'Mangalore',
      'Belgaum',
      'Gulbarga',
      'Davanagere',
      'Bellary',
      'Bijapur',
      'Shimoga',
      'Tumkur',
      'Raichur',
      'Bidar',
      'Hospet',
      'Hassan',
      'Gadag-Betigeri',
      'Udupi',
      'Bhadravati',
      'Chitradurga',
      'Kolar',
      'Mandya',
      'Chikmagalur',
      'Gangavati',
      'Bagalkot',
      'Ranebennuru',
    ],
  },
  {
    label: 'Kerala',
    value: 'Kerala',
    cities: [
      'Kochi',
      'Thiruvananthapuram',
      'Kozhikode',
      'Kollam',
      'Thrissur',
      'Alappuzha',
      'Palakkad',
      'Kannur',
      'Kottayam',
      'Malappuram',
      'Thalassery',
      'Ponnani',
      'Vatakara',
      'Kanhangad',
      'Payyanur',
      'Koyilandy',
      'Parappanangadi',
      'Kalamassery',
      'Neyyattinkara',
      'Kayamkulam',
      'Nedumangad',
      'Punalur',
      'Nilambur',
      'Cherthala',
    ],
  },
  {
    label: 'Madhya Pradesh',
    value: 'Madhya Pradesh',
    cities: [
      'Bhopal',
      'Indore',
      'Gwalior',
      'Jabalpur',
      'Ujjain',
      'Sagar',
      'Dewas',
      'Satna',
      'Ratlam',
      'Rewa',
      'Murwara',
      'Singrauli',
      'Burhanpur',
      'Khandwa',
      'Morena',
      'Bhind',
      'Chhindwara',
      'Guna',
      'Shivpuri',
      'Vidisha',
      'Chhatarpur',
      'Damoh',
      'Mandsaur',
      'Khargone',
      'Neemuch',
      'Pithampur',
    ],
  },
  {
    label: 'Maharashtra',
    value: 'Maharashtra',
    cities: [
      'Mumbai',
      'Pune',
      'Nagpur',
      'Thane',
      'Nashik',
      'Aurangabad',
      'Solapur',
      'Amravati',
      'Kolhapur',
      'Sangli',
      'Malegaon',
      'Akola',
      'Latur',
      'Dhule',
      'Ahmednagar',
      'Chandrapur',
      'Parbhani',
      'Jalgaon',
      'Bhusawal',
      'Nanded',
      'Warangal',
      'Ulhasnagar',
      'Satara',
      'Mira-Bhayandar',
      'Vasai-Virar',
      'Osmanabad',
      'Nandurbar',
      'Wardha',
      'Udgir',
      'Hinganghat',
    ],
  },
  {
    label: 'Manipur',
    value: 'Manipur',
    cities: [
      'Imphal',
      'Thoubal',
      'Bishnupur',
      'Churachandpur',
      'Ukhrul',
      'Senapati',
      'Tamenglong',
      'Chandel',
    ],
  },
  {
    label: 'Meghalaya',
    value: 'Meghalaya',
    cities: [
      'Shillong',
      'Tura',
      'Nongstoin',
      'Jowai',
      'Baghmara',
      'Williamnagar',
      'Nongpoh',
      'Resubelpara',
    ],
  },
  {
    label: 'Mizoram',
    value: 'Mizoram',
    cities: [
      'Aizawl',
      'Lunglei',
      'Saiha',
      'Champhai',
      'Kolasib',
      'Serchhip',
      'Mamit',
      'Lawngtlai',
    ],
  },
  {
    label: 'Nagaland',
    value: 'Nagaland',
    cities: [
      'Kohima',
      'Dimapur',
      'Mokokchung',
      'Tuensang',
      'Wokha',
      'Zunheboto',
      'Phek',
      'Kiphire',
      'Longleng',
      'Peren',
      'Mon',
    ],
  },
  {
    label: 'Odisha',
    value: 'Odisha',
    cities: [
      'Bhubaneswar',
      'Cuttack',
      'Rourkela',
      'Brahmapur',
      'Sambalpur',
      'Puri',
      'Balasore',
      'Bhadrak',
      'Baripada',
      'Jharsuguda',
      'Jeypore',
      'Barbil',
      'Khordha',
      'Sunabeda',
      'Rayagada',
      'Kendujhar',
      'Jagatsinghpur',
      'Paradip',
      'Bhawanipatna',
    ],
  },
  {
    label: 'Punjab',
    value: 'Punjab',
    cities: [
      'Ludhiana',
      'Amritsar',
      'Jalandhar',
      'Patiala',
      'Bathinda',
      'Mohali',
      'Firozpur',
      'Batala',
      'Pathankot',
      'Moga',
      'Abohar',
      'Malerkotla',
      'Khanna',
      'Phagwara',
      'Muktsar',
      'Barnala',
      'Rajpura',
      'Hoshiarpur',
      'Kapurthala',
      'Faridkot',
      'Sunam',
      'Mukerian',
      'Kot Kapura',
      'Gurdaspur',
      'Kharar',
      'Gobindgarh',
      'Mansa',
      'Malout',
    ],
  },
  {
    label: 'Rajasthan',
    value: 'Rajasthan',
    cities: [
      'Jaipur',
      'Jodhpur',
      'Udaipur',
      'Kota',
      'Ajmer',
      'Bikaner',
      'Alwar',
      'Bharatpur',
      'Sikar',
      'Pali',
      'Bhilwara',
      'Tonk',
      'Kishangarh',
      'Beawar',
      'Hanumangarh',
      'Sri Ganganagar',
      'Jhunjhunu',
      'Jaisalmer',
      'Banswara',
      'Bundi',
      'Dhaulpur',
      'Jhalawar',
      'Nagaur',
      'Sawai Madhopur',
      'Makrana',
      'Sujangarh',
      'Lachhmangarh',
    ],
  },
  {
    label: 'Sikkim',
    value: 'Sikkim',
    cities: [
      'Gangtok',
      'Namchi',
      'Geyzing',
      'Mangan',
      'Jorethang',
      'Naya Bazar',
      'Rangpo',
    ],
  },
  {
    label: 'Tamil Nadu',
    value: 'Tamil Nadu',
    cities: [
      'Chennai',
      'Coimbatore',
      'Madurai',
      'Tiruchirappalli',
      'Salem',
      'Tirunelveli',
      'Erode',
      'Vellore',
      'Thoothukudi',
      'Thanjavur',
      'Tiruppur',
      'Avadi',
      'Tambaram',
      'Ambattur',
      'Nagercoil',
      'Kumbakonam',
      'Cuddalore',
      'Kanchipuram',
      'Karur',
      'Neyveli',
      'Rajapalayam',
      'Sivakasi',
      'Pudukkottai',
      'Dindigul',
      'Pollachi',
      'Vaniyambadi',
      'Tiruvannamalai',
      'Viruthunagar',
      'Nagapattinam',
      'Viluppuram',
      'Tiruvottiyur',
      'Ambur',
      'Pallavaram',
      'Gudiyatham',
    ],
  },
  {
    label: 'Telangana',
    value: 'Telangana',
    cities: [
      'Hyderabad',
      'Warangal',
      'Nizamabad',
      'Khammam',
      'Karimnagar',
      'Ramagundam',
      'Mahabubnagar',
      'Nalgonda',
      'Adilabad',
      'Suryapet',
      'Miryalaguda',
      'Jagtial',
      'Mancherial',
      'Sangareddy',
      'Medak',
      'Vikarabad',
      'Siddipet',
      'Secunderabad',
      'Kothagudem',
    ],
  },
  {
    label: 'Tripura',
    value: 'Tripura',
    cities: [
      'Agartala',
      'Dharmanagar',
      'Udaipur',
      'Kailasahar',
      'Bishalgarh',
      'Teliamura',
      'Khowai',
      'Belonia',
      'Melaghar',
      'Sonamura',
    ],
  },
  {
    label: 'Uttar Pradesh',
    value: 'Uttar Pradesh',
    cities: [
      'Lucknow',
      'Kanpur',
      'Ghaziabad',
      'Agra',
      'Varanasi',
      'Meerut',
      'Allahabad',
      'Bareilly',
      'Moradabad',
      'Aligarh',
      'Gorakhpur',
      'Saharanpur',
      'Noida',
      'Firozabad',
      'Loni',
      'Jhansi',
      'Muzaffarnagar',
      'Mathura',
      'Shahjahanpur',
      'Rampur',
      'Mau',
      'Farrukhabad',
      'Hapur',
      'Etawah',
      'Mirzapur',
      'Bulandshahr',
      'Sambhal',
      'Amroha',
      'Hardoi',
      'Fatehpur',
      'Raebareli',
      'Orai',
      'Sitapur',
      'Bahraich',
      'Modinagar',
      'Unnao',
      'Jaunpur',
      'Lakhimpur',
      'Hathras',
      'Budaun',
    ],
  },
  {
    label: 'Uttarakhand',
    value: 'Uttarakhand',
    cities: [
      'Dehradun',
      'Haridwar',
      'Roorkee',
      'Haldwani',
      'Rudrapur',
      'Kashipur',
      'Rishikesh',
      'Kotdwar',
      'Ramnagar',
      'Pithoragarh',
      'Jaspur',
      'Kichha',
      'Sitarganj',
      'Bageshwar',
      'Almora',
      'Champawat',
      'Rudraprayag',
      'Tehri',
      'Pauri',
      'Nainital',
    ],
  },
  {
    label: 'West Bengal',
    value: 'West Bengal',
    cities: [
      'Kolkata',
      'Howrah',
      'Durgapur',
      'Asansol',
      'Siliguri',
      'Malda',
      'Bardhaman',
      'Kharagpur',
      'Haldia',
      'Raiganj',
      'Krishnanagar',
      'Nabadwip',
      'Medinipur',
      'Jalpaiguri',
      'Balurghat',
      'Basirhat',
      'Bankura',
      'Chakdaha',
      'Darjeeling',
      'Alipurduar',
      'Purulia',
      'Jangipur',
      'Bolpur',
      'Bangaon',
      'Cooch Behar',
    ],
  },
  // Union Territories
  {
    label: 'Andaman and Nicobar Islands',
    value: 'Andaman and Nicobar Islands',
    cities: [
      'Port Blair',
      'Diglipur',
      'Mayabunder',
      'Rangat',
      'Neil Island',
      'Havelock Island',
    ],
  },
  {
    label: 'Chandigarh',
    value: 'Chandigarh',
    cities: ['Chandigarh'],
  },
  {
    label: 'Dadra and Nagar Haveli and Daman and Diu',
    value: 'Dadra and Nagar Haveli and Daman and Diu',
    cities: ['Daman', 'Diu', 'Silvassa'],
  },
  {
    label: 'Jammu and Kashmir',
    value: 'Jammu and Kashmir',
    cities: [
      'Srinagar',
      'Jammu',
      'Baramulla',
      'Anantnag',
      'Sopore',
      'Kathua',
      'Budgam',
      'Udhampur',
      'Punch',
      'Rajouri',
      'Kupwara',
      'Ganderbal',
      'Kulgam',
      'Bandipora',
      'Doda',
      'Ramban',
      'Kishtwar',
      'Samba',
      'Reasi',
    ],
  },
  {
    label: 'Ladakh',
    value: 'Ladakh',
    cities: ['Leh', 'Kargil'],
  },
  {
    label: 'Lakshadweep',
    value: 'Lakshadweep',
    cities: ['Kavaratti', 'Agatti', 'Minicoy'],
  },
  {
    label: 'Puducherry',
    value: 'Puducherry',
    cities: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
  },
];

const AddProperty = ({ navigation }) => {
  const { theme: mode } = useContext(ThemeContext);
  const { addProperty } = useProperty();

  // Theme variables
  const isDark = mode === 'dark';

  const cardBackground = isDark ? colors.backgroundDark : colors.white;
  const textPrimary = isDark ? colors.white : colors.textPrimary;
  const textSecondary = isDark ? colors.light_gray : colors.textSecondary;

  // Form state - Updated to match CreatePropertyDto
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    postalCode: '', // Updated from pincode to match DTO
    country: 'India', // Default country
    totalArea: '',
    yearBuilt: '',
    propertyType: 'Residential', // Updated field name to match DTO
    isParkingAvailable: false,
    isElevatorAvailable: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableCities, setAvailableCities] = useState([]);

  // Convert INDIAN_STATES_DATA to picker format
  const statePickerItems = INDIAN_STATES_DATA.map(state => ({
    label: state.label,
    value: state.value,
  }));

  // Get cities for selected state
  const getCitiesForState = stateName => {
    const state = INDIAN_STATES_DATA.find(s => s.value === stateName);
    return state
      ? state.cities.map(city => ({ label: city, value: city }))
      : [];
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Update available cities when state changes
    if (field === 'state') {
      const cities = getCitiesForState(value);
      setAvailableCities(cities);
      // Reset city when state changes
      setFormData(prev => ({ ...prev, city: '' }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Check if form has validation errors (without setting state)
  const hasValidationErrors = () => {
    // Required fields
    if (!formData.name.trim()) return true;
    if (!formData.address.trim()) return true;

    // Optional fields validation
    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode))
      return true;
    if (
      formData.totalArea &&
      (isNaN(formData.totalArea) || parseFloat(formData.totalArea) <= 0)
    )
      return true;
    if (
      formData.yearBuilt &&
      (isNaN(formData.yearBuilt) ||
        parseInt(formData.yearBuilt, 10) < 1800 ||
        parseInt(formData.yearBuilt, 10) > new Date().getFullYear())
    )
      return true;

    return false;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Optional fields validation with proper formatting
    if (formData.postalCode && !/^\d{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid 6-digit postal code';
    }

    if (
      formData.totalArea &&
      (isNaN(formData.totalArea) || parseFloat(formData.totalArea) <= 0)
    ) {
      newErrors.totalArea = 'Please enter a valid area in square feet';
    }

    if (
      formData.yearBuilt &&
      (isNaN(formData.yearBuilt) ||
        parseInt(formData.yearBuilt, 10) < 1800 ||
        parseInt(formData.yearBuilt, 10) > new Date().getFullYear())
    ) {
      newErrors.yearBuilt = 'Please enter a valid year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Format data to match API expectations
      const propertyData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        postalCode: formData.postalCode.trim() || undefined,
        country: formData.country.trim() || undefined,

        totalArea: formData.totalArea
          ? parseFloat(formData.totalArea)
          : undefined,
        yearBuilt: formData.yearBuilt
          ? parseInt(formData.yearBuilt, 10)
          : undefined,
        propertyType: formData.propertyType || undefined,
        isParkingAvailable: formData.isParkingAvailable,
        isElevatorAvailable: formData.isElevatorAvailable,
      };

      // Remove undefined values to avoid sending empty fields
      Object.keys(propertyData).forEach(key => {
        if (propertyData[key] === undefined) {
          delete propertyData[key];
        }
      });

      await addProperty(propertyData);

      navigation.goBack();
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to add property. Please try again.',
      );
      console.error('Add property error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Property type options - Updated to match common property types
  const propertyTypes = [
    { label: 'Residential', value: 'Residential', icon: 'home' },
    { label: 'Commercial', value: 'Commercial', icon: 'office-building' },
    { label: 'Industrial', value: 'Industrial', icon: 'factory' },
    // { label: 'Mixed Use', value: 'Mixed Use', icon: 'domain' },
    // { label: 'Retail', value: 'Retail', icon: 'store' },
    // { label: 'Office', value: 'Office', icon: 'briefcase' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StandardHeader navigation={navigation} title="Add Property" />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Property Information */}
        <Card style={[styles.formCard, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="home-plus-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Property Details
            </StandardText>
          </View>

          <View style={styles.formSection}>
            <StyledTextInput
              label="Property Name"
              value={formData.name}
              onChangeText={value => handleInputChange('name', value)}
              error={errors.name}
              placeholder="Enter property name"
              leftIcon="home-outline"
            />

            <Gap size="md" />

            {/* Property Type Selection */}
            <StandardText
              style={[styles.fieldLabel, { color: textPrimary }]}
              fontWeight="medium"
            >
              Property Type
            </StandardText>

            <Gap size="sm" />

            <View style={styles.typeContainer}>
              {propertyTypes.map(type => (
                <Card
                  key={type.value}
                  style={[
                    styles.typeCard,

                    formData.propertyType === type.value
                      ? styles.selectedTypeCard
                      : styles.unselectedTypeCard,
                  ]}
                  onPress={() => handleInputChange('propertyType', type.value)}
                >
                  <View style={styles.typeContent}>
                    <MaterialCommunityIcons
                      name={type.icon}
                      size={24}
                      color={
                        formData.propertyType === type.value
                          ? colors.primary
                          : textSecondary
                      }
                    />
                    <StandardText
                      style={[
                        styles.typeLabel,
                        {
                          color:
                            formData.propertyType === type.value
                              ? colors.primary
                              : textSecondary,
                        },
                      ]}
                      fontWeight={
                        formData.propertyType === type.value ? 'bold' : 'medium'
                      }
                    >
                      {type.label}
                    </StandardText>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        </Card>

        <Gap size="lg" />

        {/* Address Information */}
        <Card style={[styles.formCard, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Address Information
            </StandardText>
          </View>

          <View style={styles.formSection}>
            <StyledTextInput
              label="Full Address"
              value={formData.address}
              onChangeText={value => handleInputChange('address', value)}
              error={errors.address}
              placeholder="Enter complete address"
              leftIcon="map-marker-outline"
              multiline
              numberOfLines={2}
            />

            <Gap size="md" />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <StandardText
                  style={[styles.fieldLabel, { color: textPrimary }]}
                  fontWeight="medium"
                >
                  State *
                </StandardText>
                <SearchableDropdown
                  items={statePickerItems}
                  selectedValue={formData.state}
                  onValueChange={value => handleInputChange('state', value)}
                  placeholder="Select State"
                  searchPlaceholder="Search states..."
                  leftIcon="map-outline"
                />
              </View>
              <Gap size="md" horizontal />
              <View style={styles.halfInput}>
                <StandardText
                  style={[styles.fieldLabel, { color: textPrimary }]}
                  fontWeight="medium"
                >
                  City *
                </StandardText>
                <SearchableDropdown
                  items={availableCities}
                  selectedValue={formData.city}
                  onValueChange={value => handleInputChange('city', value)}
                  placeholder={
                    formData.state ? 'Select City' : 'Select State first'
                  }
                  searchPlaceholder="Search cities..."
                  leftIcon="city-variant-outline"
                  disabled={!formData.state}
                />
              </View>
            </View>

            <Gap size="md" />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <StyledTextInput
                  label="Postal Code"
                  value={formData.postalCode}
                  onChangeText={value => handleInputChange('postalCode', value)}
                  error={errors.postalCode}
                  placeholder="PIN code"
                  leftIcon="mailbox-outline"
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
              <Gap size="md" horizontal />
              <View style={styles.halfInput}>
                <StyledTextInput
                  label="Country"
                  value={formData.country}
                  onChangeText={value => handleInputChange('country', value)}
                  error={errors.country}
                  placeholder="Country"
                  leftIcon="flag-outline"
                  editable={false}
                />
              </View>
            </View>
          </View>
        </Card>

        <Gap size="lg" />

        {/* Property Details */}
        <Card style={[styles.formCard, { backgroundColor: cardBackground }]}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color={colors.primary}
            />
            <StandardText
              style={[styles.sectionTitle, { color: textPrimary }]}
              fontWeight="bold"
            >
              Additional Details
            </StandardText>
          </View>

          <View style={styles.formSection}>
            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <StyledTextInput
                  label="Total Area (sq ft)"
                  value={formData.totalArea}
                  onChangeText={value => handleInputChange('totalArea', value)}
                  error={errors.totalArea}
                  placeholder="Area in sq ft"
                  leftIcon="ruler-square"
                  keyboardType="numeric"
                />
              </View>
              <Gap size="md" horizontal />
              <View style={styles.halfInput}>
                <StyledTextInput
                  label="Year Built"
                  value={formData.yearBuilt}
                  onChangeText={value => handleInputChange('yearBuilt', value)}
                  error={errors.yearBuilt}
                  placeholder="e.g., 2020"
                  leftIcon="calendar-outline"
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>

            <Gap size="md" />

            {/* Amenities */}
            <StandardText
              style={[styles.fieldLabel, { color: textPrimary }]}
              fontWeight="medium"
            >
              Available Amenities
            </StandardText>

            <Gap size="sm" />

            <View style={styles.amenityContainer}>
              <Card
                style={[styles.amenityCard]}
                onPress={() =>
                  handleInputChange(
                    'isParkingAvailable',
                    !formData.isParkingAvailable,
                  )
                }
              >
                <View style={styles.amenityContent}>
                  <MaterialCommunityIcons
                    name="car"
                    size={20}
                    color={
                      formData.isParkingAvailable
                        ? colors.primary
                        : textSecondary
                    }
                  />
                  <StandardText
                    style={[
                      styles.amenityLabel,
                      {
                        color: formData.isParkingAvailable
                          ? colors.primary
                          : textSecondary,
                      },
                    ]}
                    fontWeight={formData.isParkingAvailable ? 'bold' : 'medium'}
                  >
                    Parking
                  </StandardText>
                </View>
              </Card>

              <Card
                style={[styles.amenityCard]}
                onPress={() =>
                  handleInputChange(
                    'isElevatorAvailable',
                    !formData.isElevatorAvailable,
                  )
                }
              >
                <View style={styles.amenityContent}>
                  <MaterialCommunityIcons
                    name="elevator"
                    size={20}
                    color={
                      formData.isElevatorAvailable
                        ? colors.primary
                        : textSecondary
                    }
                  />
                  <StandardText
                    style={[
                      styles.amenityLabel,
                      {
                        color: formData.isElevatorAvailable
                          ? colors.primary
                          : textSecondary,
                      },
                    ]}
                    fontWeight={
                      formData.isElevatorAvailable ? 'bold' : 'medium'
                    }
                  >
                    Elevator
                  </StandardText>
                </View>
              </Card>
            </View>
          </View>
        </Card>

        <Gap size="xl" />

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            style={[styles.button, styles.cancelButton]}
            labelStyle={[styles.buttonLabel, { color: textSecondary }]}
            onPress={() => navigation.goBack()}
          >
            Cancel
          </Button>

          <Button
            mode="contained"
            style={[
              styles.button,
              styles.saveButton,
              (loading || hasValidationErrors()) && styles.disabledButton,
            ]}
            labelStyle={[styles.buttonLabel, { color: colors.white }]}
            onPress={handleSave}
            loading={loading}
            disabled={loading || hasValidationErrors()}
          >
            {loading ? 'Adding...' : 'Add Property'}
          </Button>
        </View>

        {/* Validation hint */}
        {hasValidationErrors() && !loading && (
          <StandardText
            style={[styles.validationHint, { color: textSecondary }]}
          >
            Please fill in all required fields correctly
          </StandardText>
        )}

        <Gap size="xxl" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  formCard: {
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    marginLeft: 12,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  typeCard: {
    flex: 1,
    borderRadius: 8,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    backgroundColor: colors.white,
    minWidth: 90,
    borderColor: colors.white,
  },
  selectedTypeCard: {
    borderWidth: 1,
  },
  unselectedTypeCard: {
    borderWidth: 1,
  },
  typeContent: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  typeLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  halfInput: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 4,
  },
  cancelButton: {
    borderColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  disabledButton: {
    backgroundColor: colors.light_gray,
    opacity: 0.6,
  },
  buttonLabel: {
    fontSize: 16,
    fontFamily: 'Metropolis-Medium',
  },
  validationHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Metropolis-Regular',
  },
  amenityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityCard: {
    borderRadius: 8,
    elevation: 1,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    minWidth: 100,
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
  amenityContent: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  amenityLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: colors.white,
    marginTop: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Metropolis-Regular',
  },
  disabledInput: {
    backgroundColor: colors.light_gray,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  dropdownTitle: {
    fontSize: 18,
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: 'Metropolis-Regular',
  },
});

export default AddProperty;
