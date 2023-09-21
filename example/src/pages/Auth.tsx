import { useCourierPush, useCourierAuth } from "@trycourier/courier-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Env from "../Env";

const Auth = () => {

  const push = useCourierPush();
  const auth = useCourierAuth();

  useEffect(() => {

    console.log('-- Courier User Id Changed --');
    console.log(auth.userId);

  }, [auth.userId]);

  async function signIn(userId: string) {

    try {
      
      await auth.signIn({
        accessToken: Env.accessToken,
        clientKey: Env.clientKey,
        userId: userId,
      });

      const requestStatus = await push.requestNotificationPermission();
      console.log('Request Notification Status: ' + requestStatus);
      console.log('Get Notification Status: ' + push.notificationPermissionStatus);

    } catch (e) {

      console.error(e);

    }

  }

  async function signOut() {
    await auth?.signOut();
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      marginBottom: 10,
    },
  });

  const AuthButton = (props: { buttonText: string }) => {

    const [modalVisible, setModalVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<any>(null);

    const styles = StyleSheet.create({
      button: {
        backgroundColor: 'lightgray',
        padding: 10,
        borderRadius: 5,
      },
      buttonText: {
        fontSize: 16,
      },
      modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 5,
        elevation: 5,
        minWidth: 300,
      },
      input: {
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
      },
    });

    useEffect(() => {
      if (modalVisible) {
        inputRef.current.focus();
      }
    }, [modalVisible]);
  
    const handleButtonPress = () => {

      if (auth?.userId) {
        signOut();
      } else {
        setModalVisible(true);
      }

    };
  
    const handleModalClose = () => {
      setModalVisible(false);
    };
  
    const handleTextInputChange = (text: string) => {
      setInputValue(text);
    };
  
    const handleSaveButtonPress = () => {
      signIn(inputValue);
      setModalVisible(false);
    };
  
    return (
      <>
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text>Set Courier User Id:</Text>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={inputValue}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={handleTextInputChange}
              />
              <Button title="Sign In" onPress={handleSaveButtonPress} />
              <Button title="Cancel" onPress={handleModalClose} />
            </View>
          </View>
        </Modal>
        <TouchableOpacity style={styles.button} onPress={handleButtonPress}>
          <Text style={styles.buttonText}>{props.buttonText}</Text>
        </TouchableOpacity>
      </>
    );
  };
  
  return (
    <View style={styles.container}>

      {auth.isLoading && (
        <ActivityIndicator size="small" />
      )}

      {!auth.isLoading && (
        <>
          {auth.userId && <Text style={styles.text}>{auth.userId}</Text>}
          <AuthButton buttonText={auth.userId ? 'Sign Out' : 'Sign In'} />
        </>
      )}

    </View>
  );

};

export default Auth;