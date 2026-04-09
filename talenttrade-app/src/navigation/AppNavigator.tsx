import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Text, View } from "react-native";

import { useAuth } from "../providers/AuthProvider";
import { ChatScreen } from "../screens/ChatScreen";
import { DiscoverScreen } from "../screens/DiscoverScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { MatchesScreen } from "../screens/MatchesScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { SessionsScreen } from "../screens/SessionsScreen";
import { SkillsScreen } from "../screens/SkillsScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0e1b2c"
        },
        headerTintColor: "#f7f4ea",
        tabBarStyle: {
          backgroundColor: "#0e1b2c",
          borderTopColor: "#1f3550"
        },
        tabBarActiveTintColor: "#ffcf70",
        tabBarInactiveTintColor: "#d8d5cc"
      }}
    >
      <Tab.Screen name="Descubrir" component={DiscoverScreen} />
      <Tab.Screen name="Coincidencias" component={MatchesScreen} />
      <Tab.Screen name="Sesiones" component={SessionsScreen} />
      <Tab.Screen name="Habilidades" component={SkillsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function SplashScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#07111f",
        alignItems: "center",
        justifyContent: "center",
        gap: 16
      }}
    >
      <ActivityIndicator size="large" color="#ffcf70" />
      <Text style={{ color: "#f7f4ea", fontSize: 16 }}>Preparando TalentTrade...</Text>
    </View>
  );
}

export function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: "#f7f4ea"
        }
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0e1b2c"
          },
          headerTintColor: "#f7f4ea",
          contentStyle: {
            backgroundColor: "#f7f4ea"
          }
        }}
      >
        {token ? (
          <>
            <Stack.Screen name="TalentTrade" component={TabsNavigator} options={{ headerShown: false }} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Entrar" component={LoginScreen} />
            <Stack.Screen name="Crear cuenta" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
