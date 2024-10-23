import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface TabItem {
  title: string;
  key: string;
}

export const Tab = ({ title, isSelected, onPress }: { title: string; isSelected: boolean; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} style={[styles.tabButton, isSelected && styles.selectedTabButton]}>
    <Text style={[styles.tabText, isSelected && styles.selectedTabText]}>{title}</Text>
  </TouchableOpacity>
);

export const TabControl = ({ tabs, selectedTab, setSelectedTab }: { tabs: TabItem[]; selectedTab: string; setSelectedTab: (tab: string) => void }) => (
  <View style={styles.segmentedControl}>
    {tabs.map((tab) => (
      <Tab
        key={tab.key}
        title={tab.title}
        isSelected={selectedTab === tab.key}
        onPress={() => setSelectedTab(tab.key)}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  segmentedControl: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  tabButton: {
    padding: 16,
    flex: 1,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  selectedTabButton: {
    borderBottomColor: 'blue',
  },
  tabText: {
    color: 'black',
  },
  selectedTabText: {
    fontWeight: 'bold',
  },
});