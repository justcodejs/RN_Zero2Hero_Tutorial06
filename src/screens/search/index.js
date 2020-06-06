/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Api from '../../lib/api';
import Helper from '../../lib/helper';
import WordDefinition from '../../components/wordDef';
import Header from '../../components/header';
import commonStyles from '../../../commonStyles';
import Icon from 'react-native-vector-icons/Ionicons';

// 20200502 JustCode: Import the camera module
import Camera, { Constants } from "../../components/camera";
import WordSelector from "../../components/wordSelector";

// 20200529 JustCode: Import the LocalizedStrings module and the locale text file
import LocalizedStrings from 'react-native-localization';
var localeFile = require('./locale.json');
let localizedStrings = new LocalizedStrings(localeFile);

class Search extends React.Component {
  constructor(props) {
    super(props);
    // 20200502 JustCode:
    // Add in showCamera, showWordList and recogonizedText state
    this.state = {userWord: '', errorMsg: '', loading: false, definition: null, showCamera: false, showWordList: false, recogonizedText: null};
  }

  onUserWordChange(text) {
    this.setState({userWord: text});
  }

  async onSearch() {
    if(this.state.userWord.length <= 0) {
      // 20200529 JustCode - Change the hard coded string to localized string
      this.setState({errorMsg: localizedStrings.Error.EmptyWord})
      return;
    }

    try {
      this.setState({loading: true});
      let lemmas = await Api.getLemmas(this.state.userWord);
      console.log('Lemmas: ', lemmas);
      if(lemmas.success) {
        let headWord = Helper.carefullyGetValue(lemmas, ['payload', 'results', '0', 'lexicalEntries', '0', 'inflectionOf', '0', 'id'], '');
        console.log('Headword is: ', headWord);
        if(headWord.length > 0) {
          let wordDefinition = await Api.getDefinition(headWord);
          if(wordDefinition.success) {
            this.setState({errorMsg: '', loading: false, definition: wordDefinition.payload});
            console.log('Word Definition: ', wordDefinition.payload);
          }
          else {
            // 20200529 JustCode - Change the hard coded string to localized string
            this.setState({errorMsg: localizedStrings.Error.OxfordIssue + wordDefinition.message, loading: false, definition: null});
          }
        }
        else {
          // 20200529 JustCode - Change the hard coded string to localized string
          this.setState({errorMsg: localizedStrings.Error.InvalidWord, loading: false, definition: null});
        }
      }
      else {
        // 20200529 JustCode - Change the hard coded string to localized string
        this.setState({errorMsg: localizedStrings.Error.OxfordIssue + lemmas.message, loading: false, definition: null});
      }
    } catch (error) {
      console.log('Error: ', error);
      this.setState({loading: false, errorMsg: error.message, definition: null});
    }
  }

  // 20200502 JustCode:
  // Receive the recogonizedText from the Camera module
  onOCRCapture(recogonizedText) {
    console.log('onCapture', recogonizedText);
    this.setState({showCamera: false, showWordList: Helper.isNotNullAndUndefined(recogonizedText), recogonizedText: recogonizedText});
  }

  // 20200502 JustCode:
  // Receive the word selected by the user via WordSelector component
  onWordSelected(word) {
    this.setState({showWordList: false, userWord: word});
    if(word.length > 0) {
      setTimeout(() => {
        this.onSearch();
      }, 500);
    }
  }

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
              {/* 20200529 JustCode - Change the hard coded string to localized string */}
              <Text style={commonStyles.sectionTitle}>{localizedStrings.SubTitle}</Text>
            </View>
            
            {/* 
              20200430 - JustCode:
                Add camera button to allow user to use camera to capture word. Both the 
                TextInput & TouchableOpacity will be wrapped with a new View.
            */}
            <View style={styles.searchBox}>
              <TextInput style={styles.searchInput}
                onChangeText={text => this.onUserWordChange(text)}
                // 20200529 JustCode - Change the hard coded string to localized string
                placeholder={localizedStrings.PlaceHolder}
                value={this.state.userWord}
              />
              <TouchableOpacity style={styles.searchCamera} onPress={() => {
                this.setState({showCamera: true});
              }}>
                <Icon name="ios-camera" size={25} color="#22222288"  />
              </TouchableOpacity>
            </View>

            <View style={{minHeight: 10, maxHeight: 10}}></View>

            <Button
              // 20200529 JustCode - Change the hard coded string to localized string
              title={localizedStrings.BtnSearch}
              onPress={() => this.onSearch()}
            />

            {
              this.state.errorMsg.length > 0 &&
              <Text style={commonStyles.errMsg}>{this.state.errorMsg}</Text>
            }

            {/* Display word definition as custom component */}
            <WordDefinition def={this.state.definition} />
          </ScrollView>
        </SafeAreaView>
        {
          // 20200502 - JustCode:
          // Display the camera to capture text
          this.state.showCamera &&
          <Camera
            cameraType={Constants.Type.back}
            flashMode={Constants.FlashMode.off}
            autoFocus={Constants.AutoFocus.on}
            whiteBalance={Constants.WhiteBalance.auto}
            ratio={'4:3'}
            quality={0.5}
            imageWidth={800}
            enabledOCR={true}
            onCapture={(data, recogonizedText) => this.onOCRCapture(recogonizedText)} 
            onClose={_ => {
              this.setState({showCamera: false});
            }}
          />
        }
        {
          // 20200502 - JustCode:
          // Display the word list capture by the camera and allow user to select
          this.state.showWordList &&
          <WordSelector wordBlock={this.state.recogonizedText} onWordSelected={(word) => this.onWordSelected(word)} />
        }
        {
          this.state.loading &&
          <ActivityIndicator style={commonStyles.loading} size="large" color={'#219bd9'} />
        }
      </>
    );
  }
}

export default (props) => {
  const navigation = useNavigation();
  return (
    <Search {...props} navigation={navigation} />
  )
}

const styles = StyleSheet.create({
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    height: 40, 
    borderColor: 'gray', 
    borderWidth: 1, 
    paddingLeft: 4, 
    paddingRight: 4, 
    paddingTop: 2, 
    paddingBottom: 2
  },
  searchInput: {
    padding: 0,
    flex: 1
  },
  // 20200502 - JustCode:
  // Camera icon style
  searchCamera: {
    maxWidth: 50,
    marginLeft: 5,
    padding: 0,
    alignSelf: 'center'
  }
});