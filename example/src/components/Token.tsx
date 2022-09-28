import { View, Text, StyleSheet } from 'react-native';
import React from 'react';

type PropType = {
  token?: string;
  title: string;
};
const Token = ({ token, title }: PropType) => {
  return (
    <View style={Styles.container}>
      {Boolean(token) && <Text style={Styles.tokenTitle}>{title}</Text>}
      <Text style={Styles.tokenStyle}>{token}</Text>
    </View>
  );
};

const Styles = StyleSheet.create({
  container: {
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    alignItems: 'center',
    marginTop: 8,
    minHeight: 130,
    width: '100%',
    padding: 12,
  },
  tokenTitle: {
    color: 'white',
    paddingBottom: 12,
    textTransform: 'uppercase',
  },
  tokenStyle: {
    color: 'white',
  },
});

export default Token;
