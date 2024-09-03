import Courier from "@trycourier/courier-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Button, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Env from "../Env";
import { ExampleServer } from "../Utils";
import { usePoke } from '../Poke';

const Auth = () => {

  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | undefined>()
  const [tenantId, setTenantId] = useState<string | undefined>()

  useEffect(() => {

    const authListener = Courier.shared.addAuthenticationListener({
      onUserChanged: (userId) => {
        setUserId(userId);
        setTenantId(Courier.shared.tenantId);
        console.log(`User changed: ${userId}`);
        console.log(`Tenant changed: ${Courier.shared.tenantId}`);
      }
    });

    const userId = Courier.shared.userId;
    const tenantId = Courier.shared.tenantId;
    console.log(`Initial user: ${userId}`);
    console.log(`Initial tenant: ${tenantId}`);
    refreshJWT(userId, tenantId);

    return () => {
      authListener.remove();
    };

  }, []);

  async function refreshJWT(userId?: string, tenantId?: string) {

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
        tenantId: tenantId,
      });

    } catch (e) {

      console.error(e);

    }

    setIsLoading(false);

  }

  async function signIn(userId: string, tenantId: string) {

    console.log('Signing User In');
    console.log(`User ID: ${userId}`);
    console.log(`Tenant ID: ${tenantId}`);

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
        tenantId: tenantId.length ? tenantId : undefined
      });

      setUserId(Courier.shared.userId);
      setTenantId(Courier.shared.tenantId);

    } catch (e) {

      console.error(e);

    }

    setIsLoading(false);

  }

  async function signOut() {
    await Courier.shared.signOut();
    setUserId(Courier.shared.userId);
    setTenantId(Courier.shared.tenantId);
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      marginBottom: 10,
      fontFamily: Platform.select({
        ios: 'Courier',
        android: 'monospace',
        default: 'monospace',
      }),
      fontSize: 16,
    },
  });

  const AuthButton = (props: { buttonText: string }) => {

    const [modalVisible, setModalVisible] = useState(false);
    const [userId, setUserId] = useState('');
    const [tenantId, setTenantId] = useState('');
    const inputRef = useRef<any>(null);

    const styles = StyleSheet.create({
      button: {
        backgroundColor: 'lightgray',
        padding: 10,
        borderRadius: 5,
      },
      buttonText: {
        fontSize: 16,
        fontFamily: Platform.select({
          ios: 'Courier',
          android: 'monospace',
          default: 'monospace',
        }),
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

      if (Courier.shared.userId) {
        signOut();
      } else {
        setModalVisible(true);
      }

    };
  
    const handleModalClose = () => {
      setModalVisible(false);
    };
  
    const handleUserIdInputChange = (text: string) => {
      setUserId(text);
    };

    const handleTenantIdInputChange = (text: string) => {
      setTenantId(text);
    };
  
    const handleSaveButtonPress = () => {
      signIn(userId, tenantId);
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
                value={userId}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={handleUserIdInputChange}
              />
              <Text>Set Tenant Id:</Text>
              <TextInput
                style={styles.input}
                value={tenantId}
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={handleTenantIdInputChange}
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
  
  const ToggleTouchesButton = () => {
    const styles = StyleSheet.create({
      button: {
        backgroundColor: 'lightgray',
        padding: 10,
        borderRadius: 5,
        marginTop: 10, // Add some space between buttons
      },
      buttonText: {
        fontSize: 16,
        fontFamily: Platform.select({
          ios: 'Courier',
          android: 'monospace',
          default: 'monospace',
        }),
      },
    });
    const [enabled, setEnabledState] = useState(false);
    const { setEnabled } = usePoke();

    const handleToggle = () => {
      const newEnabled = !enabled;
      setEnabledState(newEnabled);
      setEnabled(newEnabled);
    };

    return (
      <TouchableOpacity style={styles.button} onPress={handleToggle}>
        <Text style={styles.buttonText}>{enabled ? 'Hide Touches' : 'Show Touches'}</Text>
      </TouchableOpacity>
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
          {tenantId && <Text style={styles.text}>{tenantId}</Text>}
          <AuthButton buttonText={userId ? 'Sign Out' : 'Sign In'} />
          <ToggleTouchesButton />
        </>
      )}

    </View>
  );

};

export default Auth;