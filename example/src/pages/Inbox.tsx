import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import InboxStyled from './InboxStyled';
import InboxDefault from './InboxDefault';
import InboxCustom from './InboxCustom';

const Tab = createMaterialTopTabNavigator();

const Inbox = () => {
  
  return (
    <Tab.Navigator>
      <Tab.Screen name="Default" component={InboxDefault} />
      <Tab.Screen name="Styled" component={InboxStyled} />
      <Tab.Screen name="Custom" component={InboxCustom} />
    </Tab.Navigator>
  );

};

export default Inbox;