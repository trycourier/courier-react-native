import Courier, { CourierInboxTheme, CourierInboxView, InboxMessage } from '@trycourier/courier-react-native';
import React from 'react';
import { View, StyleSheet, ActionSheetIOS, Platform, Alert } from 'react-native';
import { Styles } from '../Styles';
import Env from '../../Env';

const InboxStyled = () => {

  function getTheme(isDark: boolean): CourierInboxTheme {

    const styles = Styles(isDark)
    
    return {
      brandId: Env.brandId,
      tabIndicatorColor: styles.Colors.action,
      tabStyle: {
        selected: {
          font: {
            family: styles.Fonts.title,
            size: styles.TextSizes.title,
            color: styles.Colors.heading
          },
          indicator: {
            font: {
              family: styles.Fonts.title,
              size: 14,
              color: '#FFFFFF'
            },
            color: styles.Colors.action
          }
        },
        unselected: {
          font: {
            family: styles.Fonts.title,
            size: styles.TextSizes.title,
            color: styles.Colors.subtitle
          },
          indicator: {
            font: {
              family: styles.Fonts.title,
              size: 14,
              color: '#000000'
            },
            color: styles.Colors.subtitle
          }
        }
      },
      readingSwipeActionStyle: {
        read: {
          icon: Platform.OS === 'ios' ? 'icon_undo' : 'icon_undo',
          color: styles.Colors.subtitle
        },
        unread: {
          icon: Platform.OS === 'ios' ? 'icon_check' : 'icon_check',
          color: styles.Colors.action
        }
      },
      archivingSwipeActionStyle: {
        archive: {
          icon: Platform.OS === 'ios' ? 'icon_archive' : 'icon_archive',
          color: styles.Colors.warning
        }
      },
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

  const showMessageActions = (message: InboxMessage) => {
    if (Platform.OS === 'android') {
      Alert.alert(
        'Message Actions',
        '',
        [
          {
            text: message.read ? 'Mark as Unread' : 'Mark as Read',
            onPress: () => {
              message.read ? Courier.shared.unreadMessage({ messageId: message.messageId }) : Courier.shared.readMessage({ messageId: message.messageId });
            },
          },
          {
            text: message.archived ? 'Unarchive' : 'Archive',
            onPress: () => {
              message.archived ? null : Courier.shared.archiveMessage({ messageId: message.messageId });
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    } else if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [message.read ? 'Mark as Unread' : 'Mark as Read', message.archived ? 'Unarchive' : 'Archive', 'Cancel'],
          cancelButtonIndex: 2,
          destructiveButtonIndex: 1,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 0:
              message.read ? Courier.shared.unreadMessage({ messageId: message.messageId }) : Courier.shared.readMessage({ messageId: message.messageId });
              break;
            case 1:
              message.archived ? null : Courier.shared.archiveMessage({ messageId: message.messageId });
              break;
          }
        }
      );
    }
  };
  
  return (
    <View style={styles.container}>
      <CourierInboxView 
        canSwipePages={false}
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
        onLongPressInboxMessageAtIndex={(message, _index) => {
          showMessageActions(message);
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