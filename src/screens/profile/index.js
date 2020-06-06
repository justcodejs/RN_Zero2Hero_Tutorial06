/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../../components/header';
import commonStyles from '../../../commonStyles';

// 20200529 JustCode: Import the LocalizedStrings module and the locale text file
import LocalizedStrings from 'react-native-localization';
var localeFile = require('./locale.json');
let localizedStrings = new LocalizedStrings(localeFile);

class Profile extends React.Component {
  
  render() {
    // 20200529 JustCode: Set the language pass in via props
    localizedStrings.setLanguage(this.props.lang);

    return (
      <>
        <SafeAreaView
          style={commonStyles.content}>
          {/* 20200529 JustCode - Change the hard coded string to localized string */}
          <Header navigation={this.props.navigation} Title={localizedStrings.Title} isAtRoot={true} />
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
          >
            
            <View style={[commonStyles.column, commonStyles.header]}>
              <Image style={commonStyles.logo} source={require('../../../assets/icon.png')} />
            </View>
            
            <View style={{minHeight: 10, maxHeight: 10}}></View>

            <View style={styles.fieldGroup}>
              {/* 20200529 JustCode - Change the hard coded string to localized string */}
              <Text style={styles.label}>{localizedStrings.Field.Name.Label}</Text>
              <Text>{localizedStrings.Field.Name.Value}</Text>
            </View>
            <View style={styles.fieldGroup}>
              {/* 20200529 JustCode - Change the hard coded string to localized string */}
              <Text style={styles.label}>{localizedStrings.Field.Gender.Label}</Text>
              <Text>{localizedStrings.Field.Gender.Value}</Text>
            </View>
            <View style={styles.fieldGroup}>
              {/* 20200529 JustCode - Change the hard coded string to localized string */}
              <Text style={styles.label}>{localizedStrings.Field.Age.Label}</Text>
              <Text>{localizedStrings.Field.Age.Value}</Text>
            </View>
            <View style={styles.fieldGroup}>
              {/* 20200529 JustCode - Change the hard coded string to localized string */}
              <Text style={styles.label}>{localizedStrings.Field.Address.Label}</Text>
              <Text>{localizedStrings.Field.Address.Value}</Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  fieldGroup: {
    marginTop: 5,
    marginBottom: 10
  },
  label: {
    fontWeight: 'bold'
  },
  
});

export default (props) => {
  const navigation = useNavigation();
  return (
    <Profile {...props} navigation={navigation} />
  )
}