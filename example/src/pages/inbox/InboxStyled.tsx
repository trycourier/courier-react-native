import Courier, { CourierInboxTheme, CourierInboxView } from '@trycourier/courier-react-native';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Styles } from '../Styles';
import Env from '../../Env';

const InboxStyled = () => {

  function getTheme(isDark: boolean): CourierInboxTheme {

    const styles = Styles(isDark)
    
    return {
      brandId: Env.brandId,
      unreadIndicatorStyle: {
        indicator: 'dot',
        color: styles.Colors.action
      },
      titleStyle: {
        unread: {
          family: styles.Fonts.title,
          size: styles.TextSizes.title,
          color: styles.Colors.title
        },
        read: {
          family: styles.Fonts.title,
          size: styles.TextSizes.title,
          color: styles.Colors.subtitle
        }
      },
      timeStyle: {
        unread: {
          family: styles.Fonts.subtitle,
          size: styles.TextSizes.subtitle,
          color: styles.Colors.title
        },
        read: {
          family: styles.Fonts.subtitle,
          size: styles.TextSizes.subtitle,
          color: styles.Colors.subtitle
        }
      },
      bodyStyle: {
        unread: {
          family: styles.Fonts.subtitle,
          size: styles.TextSizes.subtitle,
          color: styles.Colors.subtitle
        },
        read: {
          family: styles.Fonts.subtitle,
          size: styles.TextSizes.subtitle,
          color: styles.Colors.subtitle
        }
      },
      buttonStyle: {
        unread: {
          font: {
            family: styles.Fonts.subtitle,
            size: styles.TextSizes.subtitle,
            color: '#FFFFFF'
          },
          backgroundColor: styles.Colors.action,
          cornerRadius: styles.Corners.button
        },
        read: {
          font: {
            family: styles.Fonts.subtitle,
            size: styles.TextSizes.subtitle,
            color: styles.Colors.title,
          },
          backgroundColor: styles.Colors.option,
          cornerRadius: styles.Corners.button
        }
      },
      infoViewStyle: {
        font: {
          family: styles.Fonts.title,
          size: styles.TextSizes.title,
          color: styles.Colors.title
        },
        button: {
          font: {
            family: styles.Fonts.subtitle,
            size: styles.TextSizes.subtitle,
            color: styles.Colors.action
          },
          backgroundColor: styles.Colors.title,
          cornerRadius: styles.Corners.button
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
          light: getTheme(false),
          dark: getTheme(true)
        }}
        onClickInboxMessageAtIndex={async (message, _index) => {
          console.log(message);
          if (message.read) {
            await Courier.shared.unreadMessage({ messageId: message.messageId });
          } else {
            await Courier.shared.readMessage({ messageId: message.messageId });
          }
        }}
        onClickInboxActionForMessageAtIndex={(action, _message, _index) => {
          console.log(action);
        }}
        onScrollInbox={(y, _x) => {
          console.log(`Inbox scroll offset y: ${y}`);
        }}
        style={styles.box} />
    </View>
  );

};

export default InboxStyled;