import React, { useState } from 'react';
import { View, LayoutAnimation } from 'react-native';
import { Card, Text, IconButton, useTheme } from 'react-native-paper';
import colors from '../../theme/colors';
import { FONT_WEIGHT } from '../../theme/layout';
// import {LineChart} from 'recharts-native';

const data = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 5000 },
  { month: 'Mar', revenue: 4500 },
  { month: 'Apr', revenue: 5200 },
  { month: 'May', revenue: 4900 },
];

const RevenueAccordionCard = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  // Smooth animation for expand/collapse
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <Card
      style={{
        backgroundColor: '#1e1e1e',
        borderRadius: 15,
        margin: 10,
      }}
      onPress={toggleExpand}
    >
      <View
        style={{
          justifyContent: 'space-between',
          padding: 15,
        }}
      >
        <View>
          <Text
            style={{
              color: '#fdfdfd',
              fontSize: 20,
              marginTop: 15,
              fontWeight: 'bold',
              fontFamily: 'Poppins-Regular',
            }}
          >
            REVENUE
          </Text>
          <Text
            style={{
              color: '#fdfdfd',
              fontSize: 30,
              fontWeight: 'bold',
            }}
          >
            ₹ 52365
          </Text>
          <Text style={{ color: '#fff', marginTop: 8, fontWeight: 'bold' }}>
            +0.6%
          </Text>
        </View>

        <View>
          <Text style={{ color: '#fff' }}>From last month</Text>
        </View>

        {/* Expand/Collapse Button */}
        <IconButton
          icon={expanded ? 'chevron-up' : 'chevron-down'}
          onPress={toggleExpand}
          iconColor={'#000'}
          style={{
            backgroundColor: colors.light_gray,
            padding: 0,
            position: 'absolute',
            right: 3,
            bottom: 3,
            borderRadius: 20,
            elevation: 2,
          }}
          size={20}
        />
      </View>

      {/* Expanded Section */}
      {expanded && (
        <View style={{ padding: 15 }}>
          <Text style={{ color: colors.textSecondary, marginBottom: 10 }}>
            Revenue Trends
          </Text>
          {/* <LineChart
            width={300}
            height={200}
            data={data}
            margin={{top: 10, right: 30, left: 20, bottom: 5}}>
            <LineChart.Line
              type="monotone"
              dataKey="revenue"
              stroke={colors.primary}
            />
            <LineChart.CartesianGrid stroke={colors.backgroundLight} />
            <LineChart.XAxis dataKey="month" />
            <LineChart.YAxis />
            <LineChart.Tooltip />
          </LineChart> */}
        </View>
      )}
    </Card>
  );
};

export default RevenueAccordionCard;
