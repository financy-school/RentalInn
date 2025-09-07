import React, {useState} from 'react';
import {
  View,
  TextInput,
  Button,
  Modal,
  StyleSheet,
  useWindowDimensions,
  Text,
} from 'react-native';
import {Appbar} from 'react-native-paper';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';

const FirstRoute = () => <></>;

const SecondRoute = () => <></>;

const ThirdRoute = () => <></>;

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
  third: ThirdRoute,
});

const renderTabBar = props => (
  <TabBar
    {...props}
    indicatorStyle={{backgroundColor: '#5168B6'}}
    style={{backgroundColor: '#fff'}}
    labelStyle={{}}
    renderLabel={({route, focused, color}) => (
      <Text
        style={{
          fontFamily: 'Metropolis-Regular',
          color: focused ? '#5168B6' : '#000',
          fontSize: 15,
        }}>
        {route.title}
      </Text>
    )}
  />
);

export default function Profile({navigation}) {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'first', title: 'Overview'},
    {key: 'second', title: 'Operations'},
    {key: 'third', title: 'Finance'},
  ]);

  return (
    <>
      <Appbar.Header style={{backgroundColor: '#fff'}}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={'Profile'} color="#000" />
      </Appbar.Header>
      <TabView
        renderTabBar={renderTabBar}
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: layout.width}}
        sceneContainerStyle={{backgroundColor: '#fff'}}
      />
    </>
  );
}
