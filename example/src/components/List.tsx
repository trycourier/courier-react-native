import React from "react";
import { StyleSheet, View } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import DarkModeText from "./DarkModeText";

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  items: {
    margin: 8,
    alignSelf: 'flex-start',
  },
});

export interface ListItem {
  name: string,
  value: any
}

function List({ title, items, selectedItems, onItemClick }: { title: string, items: ListItem[], selectedItems: ListItem[], onItemClick: (item: ListItem) => void }) {

  return (
    <View style={styles.container}>
      <DarkModeText text={title} />
      {items.map((item) => (
        <View style={styles.items} key={item.value}>
          <BouncyCheckbox
            text={item.name}
            isChecked={selectedItems.includes(item)}
            onPress={() => onItemClick(item)}
          />
        </View>
      ))}
    </View>
  );

}

export default List;