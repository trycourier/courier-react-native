import Courier, { CourierInboxView } from 'courier-react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import CourierInboxTheme from 'src/models/CourierInboxTheme';

const InboxStyled = () => {

  React.useEffect(() => {
    test();
  }, []);

  async function test() {

    console.log('Initial User: ' + await Courier.userId);

    const isDebugging = Courier.isDebugging;
    console.log(isDebugging);

    try {

      await Courier.signIn({
        accessToken: 'pk_prod_2M1VP0GVFE4M0RQ4ZYFW1DGH3R90',
        clientKey: 'YWQxN2M2ZmMtNDU5OS00ZThlLWE4NTktZDQ4YzVlYjkxM2Mx',
        userId: 'mike',
      })

    } catch (e) {

      console.error(e)

    }

    console.log('Current User: ' + await Courier.userId);

  }

  const textColor = '#2A1537'
  const primaryColor = '#882DB9'
  const secondaryColor = '#EA6866'

  const lightTheme: CourierInboxTheme = {
    unreadIndicatorBarColor: secondaryColor,
    loadingIndicatorColor: primaryColor,
    titleFont: {
      family: 'Avenir Black',
      size: 20,
      color: textColor
    },
    timeFont: {
      family: 'Avenir Medium',
      size: 16,
      color: textColor
    },
    bodyFont: {
      family: 'Avenir Medium',
      size: 18,
      color: textColor
    },
    detailTitleFont: {
      family: 'Avenir Medium',
      size: 20,
      color: textColor
    },
    buttonStyles: {
      font: {
        family: 'Avenir Black',
        size: 16,
        color: '#FFFFFF'
      },
      backgroundColor: primaryColor,
      cornerRadius: 100
    },
    iOS: {
      messageAnimationStyle: 'right',
      cellStyles: {
        separatorStyle: 'singleLineEtched',
        separatorInsets: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }
      }
    }
  }

  const darkTheme: CourierInboxTheme = {
    unreadIndicatorBarColor: '#ffffff',
    loadingIndicatorColor: '#ffffff',
    titleFont: {
      family: 'Avenir Black',
      size: 20,
      color: '#ffffff'
    },
    timeFont: {
      family: 'Avenir Medium',
      size: 16,
      color: '#ffffff'
    },
    bodyFont: {
      family: 'Avenir Medium',
      size: 18,
      color: '#ffffff'
    },
    detailTitleFont: {
      family: 'Avenir Medium',
      size: 20,
      color: '#ffffff'
    },
    buttonStyles: {
      font: {
        family: 'Avenir Black',
        size: 16,
        color: '#000000'
      },
      backgroundColor: '#ffffff',
      cornerRadius: 100
    },
    iOS: {
      messageAnimationStyle: 'right',
      cellStyles: {
        separatorStyle: 'singleLineEtched',
        separatorInsets: {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    box: {
      width: '100%',
      height: '100%',
    },
  });
  
  return (
    <View style={styles.container}>
      <CourierInboxView 
        lightTheme={lightTheme}
        darkTheme={darkTheme}
        onClickInboxMessageAtIndex={(message, index) => {
          console.log(message)
        }}
        onClickInboxActionForMessageAtIndex={(action, message, index) => {
          console.log(action)
        }}
        onScrollInbox={(y, x) => {
          console.log(y)
        }}
        style={styles.box} />
    </View>
  );

};

export default InboxStyled;