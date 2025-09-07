import styled from 'styled-components';
import {View, Text, Image, TextInput, TouchableOpacity} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
const StatusBarHeight = getStatusBarHeight();

export const Colors = {
  primary: '#9B9B9B',
  secondary: '#ffffffff',
  tertiary: '#1F2937',
  darkLight: '#000000',
  green: '#10B981',
  red: '#EF4444',
  brand: '#5168B6',
  light_brand: '#C4CDE6',
};

const {primary, secondary, tertiary, darkLight, brand, green, red} = Colors;
export const StyledContainer = styled.View`
  flex: 1;
  padding: 0px;
  background-color: ${primary};
  ${'' /* padding-top: ${StatusBarHeight + 30}px; */}
`;

export const InnerContainer = styled.View`
  flex: 1;
  width: 100%;
  align-items: center;
`;
export const WelcomeContainer = styled(InnerContainer)`
  padding: 25px;
  padding-top: 10px;
  justify-content: center;
`;

export const PageLogo = styled.Image`
  width: 250px;
  height: 200px;
`;
export const Avatar = styled.Image`
  width: 100px;
  height: 100px;
  margin: auto;
  border-radius: 50px;
  border-width: 2px;
  border-color: ${secondary};
  margin-bottom: 10px;
`;
export const WelcomeImage = styled.Image`
  height: 50%;
  min-width: 100%;
`;

export const PageTitle = styled.Text`
    font-size: 30px;
    text-align: center;
    font-weight: bold;
    color: ${brand}
    padding: 10px

    ${props =>
      props.welcome &&
      `
        font-size: 35px;
        `}
    `;

export const SubTitle = styled.Text`
  font-size: 18px;
  margin-bottom: 20px;
  letter-spacing: 1px;
  font-weight: bold;
  color: ${primary};
`;

export const StyledFormArea = styled.View`
  width: 100%;
`;
export const StyledTextInput = styled.TextInput`
  background-color: ${secondary};
  padding: 15px;
  border-radius: 5px;
  font-size: 16px;
  height: 60px;

  color: ${tertiary};
`;
export const StyledInputLabel = styled.Text`
  color: ${tertiary};
  font-size: 13px;
  text-align: left;
`;
export const LeftIcon = styled.View`
  left: 15px;
  top: 38px;
  position: absolute;
  z-index: 1;
`;
export const RightIcon = styled.TouchableOpacity`
  right: 15px;
  top: 12px;
  position: absolute;
  z-index: 1;
`;
export const CustomCard = styled.View`
  margin: 5px;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 10px;
  shadow-color: #000;
  shadow-offset: {
    width: 0;
    height: 2;
  }
  shadow-opacity: 0.25;
  shadow-radius: 3.84px;
  elevation: 5;
`;
export const StyledButton = styled.TouchableOpacity`
  background-color: ${brand};
  border-radius: 5px;
  margin-vertical: 5px;
  height: 50px;
  ${props =>
    props.google == true &&
    `
        background-color: ${green};
        flex-direction: row;
        justify-content: center;
    `}
`;
export const ButtonText = styled.Text`
  color: ${secondary};
  justify-content: center;
  align-items: center;
  font-size: 16px;

  ${props =>
    props.google == true &&
    `
        padding: 5px;
    `}
`;
export const MsgBox = styled.Text`
  text-align: center;
  font-size: 13px;
  color: ${props => (props.type == 'SUCCESS' ? green : red)};
`;
export const Line = styled.View`
  height: 1px;
  width: 100%;
  background-color: ${darkLight};
  margin-vertical: 10px;
`;
export const ExtraView = styled.View`
  justify-content: center;
  flex-direction: row;
  align-items: center;
  padding: 10px;
`;
export const ExtraText = styled.Text`
  justify-content: center;
  align-items: center;
  color: ${darkLight};
  font-size: 15px;
`;
export const TextLink = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
`;
export const TextLinkContent = styled.Text`
  color: ${brand};
  font-size: 15px;
`;

export const Header = styled.View`
  width: 100%;
  background-color: #5168b6;
  align-items: center;
`;

export const Title = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #fff;
`;

export const Subtitle = styled.Text`
  font-size: 14px;
  color: #eee;
`;
