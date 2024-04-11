import Courier from "@trycourier/courier-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Env from "../Env";
import { ExampleServer } from "../Utils";

const Auth = () => {

  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | undefined>()

  useEffect(() => {

    const authListener = Courier.shared.addAuthenticationListener({
      onUserChanged: (userId) => {
        console.log(`User changed: ${userId}`);
        setUserId(userId);
      }
    });

    const userId = Courier.shared.userId;
    console.log(`Initial user: ${userId}`);
    refreshJWT(userId);

    return () => {
      authListener.remove();
    };

  }, []);

  async function refreshJWT(userId?: string) {

    console.log('Refreshing JWT');

    if (!userId) {
      console.log(`No user found`);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {

      console.log(`User ID: ${userId}`);

      await Courier.shared.signOut();

      const token = await ExampleServer.generateJwt({
        authKey: Env.authKey,
        userId: userId,
      });

      console.log(`New token: ${token}`);

      await Courier.shared.signIn({
        accessToken: token,
        userId: userId,
      });

    } catch (e) {

      console.error(e);

    }

    setIsLoading(false);

  }

  async function signIn(userId: string) {

    console.log('Signing User In');
    console.log(`User ID: ${userId}`);

    setIsLoading(true);

    try {

      const token = await ExampleServer.generateJwt({
        authKey: Env.authKey,
        userId: userId,
      });

      console.log(`New token: ${token}`);
      
      await Courier.shared.signIn({
        accessToken: token,
        userId: userId,
      });

      setUserId(Courier.shared.userId);

    } catch (e) {

      console.error(e);

    }

    setIsLoading(false);

  }

  async function signOut() {
    await Courier.shared.signOut();
    setUserId(Courier.shared.userId);
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

      if (userId) {
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

      {isLoading && (
        <ActivityIndicator size="small" />
      )}

      {!isLoading && (
        <>
          {userId && <Text style={styles.text}>{userId}</Text>}
          <AuthButton buttonText={userId ? 'Sign Out' : 'Sign In'} />
        </>
      )}

    </View>
  );

};

export default Auth;