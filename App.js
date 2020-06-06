/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  View,
  StatusBar,
  Image,
  TouchableOpacity,
  Linking
} from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createDrawerNavigator, 
         DrawerContentScrollView, 
         DrawerItemList, 
         DrawerItem
       } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import Search from './src/screens/search';
import Fav from './src/screens/fav';
import Profile from './src/screens/profile';
import commonStyles from './commonStyles';

// 20200501 JustCode: Import the camera and file system module
import Camera, { Constants } from "./src/components/camera";
import RNFS from 'react-native-fs';

// 20200529 JustCode: Import the LocalizedStrings module and the locale text file
import Setting from './src/screens/setting';
import Helper from './src/lib/helper';
import LocalizedStrings from 'react-native-localization';
var localeFile = require('./locale.json');
let localizedStrings = new LocalizedStrings(localeFile);


const Drawer = createDrawerNavigator();
const DrawerNav = (props) => {
  return (
    <Drawer.Navigator 
      initialRouteName="TabNav"
      drawerContent={
        // 20200501 JustCode: 
        // Pass in the toggleCamera from parent component (App) method to DrawerContent
        // Add profilePhoto props to hold the profile image
        drawerProps => <DrawerContent {...drawerProps} 
                          toggleCamera={props.toggleCamera} 
                          profilePhoto={props.profilePhoto} 
                          />
      }
    >
      {/* 20200529 JustCode: Change the hardcoded string to the localized string */}
      <Drawer.Screen name="TabNav" 
        // component={TabNav} 20200529 JustCode - Use children element to pass in the TabNav component
        options={{title: localizedStrings.DrawerNav.Screens.Home}} 
      >
        {/* 
          20200529 JustCode - Pass in the language code via props 
          Use TabNav as children element to pass to the component of
          Drawer.Screen is to ensure TabNav get to re-render whenever
          the lang in props changed.
        */}
        {_ => <TabNav {...props} />}
      </Drawer.Screen>
      <Drawer.Screen name="Profile" 
        // component={Profile} 20200529 JustCode - Use children element to pass in the Profile component
        options={{title: localizedStrings.DrawerNav.Screens.MyProfile}} 
      >
        {_ => <Profile {...props} />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

const DrawerContent = (props) => {
  return (
    <>
      <View style={commonStyles.drawerHeader}>
        {/* 
          20200430 - JustCode:
            Add a new Camera icon on top of the profile photo.
        */}
        <View style={{width: 100, alignSelf: 'center' }}>
          <Image source={props.profilePhoto} style={commonStyles.drawerProfilePhoto} />
          <TouchableOpacity style={commonStyles.profileCamera} 
            onPress={() => {
              // Call the toggleCamera passed by DrawerNav
              props.toggleCamera && props.toggleCamera();
            }}
          >
            <Icon name="ios-camera" size={50} color="#22222288" />
          </TouchableOpacity>
        </View>
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItemList activeBackgroundColor={'transparent'} {...props} />
        {/* 20200529 JustCode: Change the hardcoded string to the localized string */}
        <DrawerItem
          label={localizedStrings.DrawerNav.Screens.About}
          onPress={() => Linking.openURL('https://www.justnice.net')}
        />
      </DrawerContentScrollView>
    </>
  );
}

const Tab = createBottomTabNavigator();
const TabNav = (props) => {
  return(
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'logo-react';

          if (route.name === 'Search') {
            iconName = 'ios-search';
          } else if (route.name === 'Fav') {
            iconName = focused ? 'ios-heart' : 'ios-heart-empty';
          } else if (route.name === 'Setting') {
            iconName = 'md-settings';
          }
          
          // You can return any component that you like here!
          return <Icon name={iconName} size={size} color={color} />;
        }
      })}
      tabBarOptions={{
        activeTintColor: 'white',
        inactiveTintColor: 'gray',
        activeBackgroundColor: '#219bd9',
        inactiveBackgroundColor: '#d6f9ff',
        safeAreaInsets: {bottom: 0},
        style: {height: 70},
        tabStyle: {paddingBottom: 15}
      }}
    >
      <Tab.Screen name="Search" 
        //component={Search} 20200529 JustCode - Use children element to pass in the Search component
        options={{title: localizedStrings.TabNav.Tabs.Search}}>
          {_ => <Search {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Fav" 
        //component={Fav} 20200529 JustCode - Use children element to pass in the Fav component
        options={{title: localizedStrings.TabNav.Tabs.Fav}}>
          {_ => <Fav {...props} />}
      </Tab.Screen>
      <Tab.Screen name="Setting" 
        //component={Setting} 20200529 JustCode - Use children element to pass in the Setting component
        options={{title: localizedStrings.TabNav.Tabs.Setting}}
      >
        {_ => <Setting {...props} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lang: 'en',        // Set the default lang to en 
      showCamera: false, // Hide the camera by default
      profilePhoto: require('./assets/icon.png') // Set the default profile photo to icon.png
    };
    
  }
  
  // 20200502 JustCode
  // Create a new constructor to check if there is any profile photo or not.
  componentDidMount() {
    // 20200529 JustCode - Get the user language setting from storage
    Helper.getDeviceLanguageFromStorage()
    .then(lang => {
      this.setState({lang: lang});
    })
    .catch(_ => {
      this.setState({lang: 'en'});
    });

    // Check if there is any profile photo or not.
    let path = RNFS.DocumentDirectoryPath + '/profilePic.png';
    RNFS.exists(path)
    .then(exist => {
      console.log('File exist: ', exist);
      if(exist) {
        RNFS.readFile(path, 'base64')
        .then(buffer => {
          console.log('File read.');
          this.setState({profilePhoto: {
            uri: 'data:image/png;base64,' + buffer
          }});
        })
        .catch(err => {
          console.log('Unable to read profile photo. ', err);
        })
      }
    })
    .catch(err => {
      console.log('Unable to access file system. ', err);
    });
  }

  saveProfilePhoto(data) {
    this.setState({showCamera: false});
    
    let path = RNFS.DocumentDirectoryPath + '/profilePic.png';

    // strip off the data: url prefix to get just the base64-encoded bytes
    var imgData = data.replace(/^data:image\/\w+;base64,/, "");
    
    // write the file
    RNFS.writeFile(path, imgData, 'base64')
    .then(_ => {
      // Update the profilePhoto state so that the profile photo will update
      // to the latest photo
      this.setState({profilePhoto: {
        uri: 'data:image/png;base64,' + imgData
      }});
    })
    .catch((err) => {
      console.log(err.message);
    });
  }

  // 20200529 Just Code
  // Update the user language
  updateAppLanguage = (lang) => {
    Helper.updateDeviceLanguageToStorage(lang);
    this.setState({lang: lang});
  }

  render() {
    localizedStrings.setLanguage(this.state.lang);

    return (
      <NavigationContainer>
        <StatusBar barStyle="default" backgroundColor="#219bd9" />
        {/*         
          20200501 JustCode:
          Define a method called toggleCamera in the props of DrawerNav.
          Define a profilePhoto prop to hold the user profile photo.
        */}
        <DrawerNav {...this.props} 
          toggleCamera={() => {
            this.setState({showCamera: !this.state.showCamera});
          }}
          profilePhoto={this.state.profilePhoto}
          // 20200529 JustCode - Pass in the language code
          lang={this.state.lang}
          // 20200529 JustCode - Pass updateAppLanguage method to allow
          // child components to update the App level language state
          // and save the lang selection into device storage
          updateAppLanguage={this.updateAppLanguage}
        />
        {/*       
          20200501 JustCode: 
          Show the camera when user click on the camera button.
        */}
        {
          this.state.showCamera &&
          <Camera
            cameraType={Constants.Type.front}
            flashMode={Constants.FlashMode.off}
            autoFocus={Constants.AutoFocus.on}
            whiteBalance={Constants.WhiteBalance.auto}
            ratio={'1:1'}
            quality={0.5}
            imageWidth={800}
            onCapture={data => this.saveProfilePhoto(data)} 
            onClose={_ => {
              this.setState({showCamera: false});
            }}
            // 20200529 JustCode - Pass in the language code
            lang={this.state.lang}
          />
        }
      </NavigationContainer>
    );
  }
}

export default App;
