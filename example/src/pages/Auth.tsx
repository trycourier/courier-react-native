import Courier from "@trycourier/courier-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Button, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const Auth = () => {

  const [userId, setUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    
    setUserId(Courier.shared.userId);

  }, []);

  async function signIn(userId: string) {

    try {

      await Courier.shared.signIn({
        accessToken: 'pk_prod_2M1VP0GVFE4M0RQ4ZYFW1DGH3R90',
        clientKey: 'YWQxN2M2ZmMtNDU5OS00ZThlLWE4NTktZDQ4YzVlYjkxM2Mx',
        userId: userId,
      });

    } catch (e) {

      console.error(e);

    }

    setUserId(Courier.shared.userId);

  }

  async function signOut() {

    try {

      await Courier.shared.signOut();

    } catch (e) {

      console.error(e);

    }

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
    const inputRef = useRef(null);

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
        inputRef.current.focus(); // Focus the input field when modal opens
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
      {userId && <Text style={styles.text}>{userId}</Text>}
      <AuthButton buttonText={userId ? 'Sign Out' : 'Sign In'} />
    </View>
  );

};

export default Auth;