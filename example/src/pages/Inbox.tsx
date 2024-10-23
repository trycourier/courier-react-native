import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import InboxDefault from './inbox/InboxDefault';
import InboxStyled from './inbox/InboxStyled';
import InboxCustom from './inbox/InboxCustom';
import { TabControl, TabItem } from '../Tabs';

const tabs: TabItem[] = [
  { title: 'Default', key: 'Default' },
  { title: 'Styled', key: 'Styled' },
  { title: 'Custom', key: 'Custom' },
];

const Inbox = () => {
  const [selectedTab, setSelectedTab] = useState('Default');

  const renderContent = () => {
    switch (selectedTab) {
      case 'Default':
        return <InboxDefault />;
      case 'Styled':
        return <InboxStyled />;
      case 'Custom':
        return <InboxCustom />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <TabControl tabs={tabs} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default Inbox;
