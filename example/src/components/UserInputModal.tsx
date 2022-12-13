import React, { useState } from 'react';
import { Button, Modal, StyleSheet, Text, TextInput, View } from 'react-native';

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  actionConatiner: {
    flexDirection: 'row',
    minWidth: '100%',
    justifyContent: 'flex-end',
  },
  cancelButtonStyle: {
    marginRight: 10,
  },
  inputStyle: {
    marginVertical: 12,
    height: 40,
    borderRadius: 5,
    borderColor: '#101010',
    borderWidth: 1,
    paddingHorizontal: 10,
    color: '#101010',
  },
  labelStyle: { fontWeight: '500', fontSize: 16 },
  inputContainer: {
    alignSelf: 'flex-start',
    width: '100%',
  },
});

type PropType = {
  open: boolean;
  onClose: () => void;
  onOkay: ({ userId }: { userId: string }) => Promise<void>;
};

function UserInputModal({ open, onClose, onOkay }: PropType) {
  const [userId, setUserId] = useState<string>('');
  return (
    <Modal
      animationType="slide"
      transparent
      visible={open}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.inputContainer}>
            <Text style={styles.labelStyle}>Enter Courier User Id</Text>
            <TextInput
              autoCapitalize="none"
              autoFocus
              autoCorrect={false}
              autoComplete="off"
              placeholder="Courier User Id"
              value={userId}
              onChangeText={setUserId}
              style={styles.inputStyle}
              placeholderTextColor="#aaa"
            />
          </View>
          <View style={styles.actionConatiner}>
            <View style={styles.cancelButtonStyle}>
              <Button title="Cancel" onPress={onClose} />
            </View>
            <Button title="Sign In" onPress={() => onOkay({ userId })} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default UserInputModal;
