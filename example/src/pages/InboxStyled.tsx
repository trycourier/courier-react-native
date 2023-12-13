import Courier, { CourierInboxTheme, CourierInboxView } from '@trycourier/courier-react-native';
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

const InboxStyled = () => {

  const textColor = '#2A1537'
  const primaryColor = '#882DB9'
  const secondaryColor = '#EA6866'

  const titleFont = Platform.OS === 'ios' ? 'Avenir Black' : 'fonts/poppins_regular.otf'
  const defaultFont = Platform.OS === 'ios' ? 'Avenir Medium' : 'fonts/poppins_regular.otf'

  const lightTheme: CourierInboxTheme = {
    loadingIndicatorColor: primaryColor,
    unreadIndicatorStyle: {
      indicator: 'dot',
      color: secondaryColor
    },
    titleStyle: {
      unread: {
        family: titleFont,
        size: 20,
        color: textColor
      },
      read: {
        family: titleFont,
        size: 20,
        color: textColor
      }
    },
    timeStyle: {
      unread: {
        family: defaultFont,
        size: 16,
        color: textColor
      },
      read: {
        family: defaultFont,
        size: 16,
        color: textColor
      }
    },
    bodyStyle: {
      unread: {
        family: defaultFont,
        size: 18,
        color: textColor
      },
      read: {
        family: defaultFont,
        size: 18,
        color: textColor
      }
    },
    buttonStyle: {
      unread: {
        font: {
          family: titleFont,
          size: 16,
          color: '#FFFFFF'
        },
        backgroundColor: primaryColor,
        cornerRadius: 100
      },
      read: {
        font: {
          family: titleFont,
          size: 16,
          color: '#FFFFFF'
        },
        backgroundColor: primaryColor,
        cornerRadius: 100
      }
    },
    infoViewStyle: {
      font: {
        family: defaultFont,
        size: 20,
        color: textColor
      },
      button: {
        font: {
          family: titleFont,
          size: 16,
          color: '#FFFFFF'
        },
        backgroundColor: primaryColor,
        cornerRadius: 100
      }
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
    },
    android: {
      dividerItemDecoration: 'vertical'
    }
  }

  const darkTheme: CourierInboxTheme = {
    loadingIndicatorColor: '#ffffff',
    unreadIndicatorStyle: {
      indicator: 'dot',
      color: '#ffffff'
    },
    titleStyle: {
      unread: {
        family: titleFont,
        size: 20,
        color: '#ffffff'
      },
      read: {
        family: titleFont,
        size: 20,
        color: '#ffffff'
      }
    },
    timeStyle: {
      unread: {
        family: defaultFont,
        size: 16,
        color: '#ffffff'
      },
      read: {
        family: defaultFont,
        size: 16,
        color: '#ffffff'
      }
    },
    bodyStyle: {
      unread: {
        family: defaultFont,
        size: 18,
        color: '#ffffff'
      },
      read: {
        family: defaultFont,
        size: 18,
        color: '#ffffff'
      }
    },
    infoViewStyle: {
      font: {
        family: defaultFont,
        size: 20,
        color: '#ffffff'
      },
      button: {
        font: {
          family: titleFont,
          size: 16,
          color: '#000000'
        },
        backgroundColor: '#ffffff',
        cornerRadius: 100
      }
    },
    buttonStyle: {
      unread: {
        font: {
          family: titleFont,
          size: 16,
          color: '#000000'
        },
        backgroundColor: '#ffffff',
        cornerRadius: 100
      },
      read: {
        font: {
          family: titleFont,
          size: 16,
          color: '#000000'
        },
        backgroundColor: '#ffffff',
        cornerRadius: 100
      }
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
    },
    android: {
      dividerItemDecoration: 'vertical'
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
        theme={{
          light: lightTheme,
          dark: darkTheme
        }}
        onClickInboxMessageAtIndex={(message, index) => {
          console.log(message)
          message.read ? Courier.shared.unreadMessage({ messageId: message.messageId }) : Courier.shared.readMessage({ messageId: message.messageId });
        }}
        onClickInboxActionForMessageAtIndex={(action, message, index) => {
          console.log(action);
        }}
        onScrollInbox={(y, x) => {
          console.log(`Inbox scroll offset y: ${y}`);
        }}
        style={styles.box} />
    </View>
  );

};

export default InboxStyled;