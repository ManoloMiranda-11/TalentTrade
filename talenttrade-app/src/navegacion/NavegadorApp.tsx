import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, Text, View } from "react-native";

import { useAutenticacion } from "../proveedores/ProveedorAutenticacion";
import { PantallaChat } from "../pantallas/PantallaChat";
import { PantallaCrearCuenta } from "../pantallas/PantallaCrearCuenta";
import { PantallaDescubrir } from "../pantallas/PantallaDescubrir";
import { PantallaInicioSesion } from "../pantallas/PantallaInicioSesion";
import { PantallaCoincidencias } from "../pantallas/PantallaCoincidencias";
import { PantallaPerfil } from "../pantallas/PantallaPerfil";
import { PantallaSesiones } from "../pantallas/PantallaSesiones";
import { PantallaHabilidades } from "../pantallas/PantallaHabilidades";
import type { ParametrosNavegacionPrincipal } from "./tiposNavegacion";

const Pila = createNativeStackNavigator<ParametrosNavegacionPrincipal>();
const Pestanas = createBottomTabNavigator();

function iconoPestana(inicial: string) {
  return ({ focused, color }: { focused: boolean; color: string }) => (
    <View
      style={{
        width: focused ? 34 : 28,
        height: 28,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? "#ffcf70" : "#20354c"
      }}
    >
      <Text style={{ color: focused ? "#0e1b2c" : color, fontWeight: "900", fontSize: 12 }}>{inicial}</Text>
    </View>
  );
}

function NavegacionPorPestanas() {
  return (
    <Pestanas.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#0e1b2c"
        },
        headerTintColor: "#f7f4ea",
        headerTitleStyle: {
          fontWeight: "800"
        },
        tabBarStyle: {
          backgroundColor: "#0e1b2c",
          borderTopColor: "#1f3550",
          height: 70,
          paddingTop: 8,
          paddingBottom: 10
        },
        tabBarActiveTintColor: "#ffcf70",
        tabBarInactiveTintColor: "#d8d5cc",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "800"
        }
      }}
    >
      <Pestanas.Screen name="Descubrir" component={PantallaDescubrir} options={{ tabBarIcon: iconoPestana("D") }} />
      <Pestanas.Screen name="Coincidencias" component={PantallaCoincidencias} options={{ tabBarIcon: iconoPestana("C") }} />
      <Pestanas.Screen name="Sesiones" component={PantallaSesiones} options={{ tabBarIcon: iconoPestana("S") }} />
      <Pestanas.Screen name="Habilidades" component={PantallaHabilidades} options={{ tabBarIcon: iconoPestana("H") }} />
      <Pestanas.Screen name="Perfil" component={PantallaPerfil} options={{ tabBarIcon: iconoPestana("P") }} />
    </Pestanas.Navigator>
  );
}

function PantallaCarga() {
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

export function NavegadorApp() {
  const { token, cargando } = useAutenticacion();

  if (cargando) {
    return <PantallaCarga />;
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
      <Pila.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0e1b2c"
          },
          headerTintColor: "#f7f4ea",
          headerTitleStyle: {
            fontWeight: "800"
          },
          contentStyle: {
            backgroundColor: "#f7f4ea"
          }
        }}
      >
        {token ? (
          <>
            <Pila.Screen name="TalentTrade" component={NavegacionPorPestanas} options={{ headerShown: false }} />
            <Pila.Screen name="Conversacion" component={PantallaChat} />
          </>
        ) : (
          <>
            <Pila.Screen name="Entrar" component={PantallaInicioSesion} />
            <Pila.Screen name="Crear cuenta" component={PantallaCrearCuenta} />
          </>
        )}
      </Pila.Navigator>
    </NavigationContainer>
  );
}
