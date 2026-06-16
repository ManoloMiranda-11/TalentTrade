import { Text, TextInput, View, type TextInputProps } from "react-native";

type PropiedadesCampoFormulario = {
  etiqueta: string;
  valor: string;
  alCambiarTexto: (valor: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  mensajeError?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: TextInputProps["keyboardType"];
  textContentType?: TextInputProps["textContentType"];
  autoComplete?: TextInputProps["autoComplete"];
};

export function CampoFormulario({
  etiqueta,
  valor,
  alCambiarTexto,
  placeholder,
  secureTextEntry,
  mensajeError,
  autoCapitalize = "sentences",
  keyboardType,
  textContentType,
  autoComplete
}: PropiedadesCampoFormulario) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#22344a" }}>{etiqueta}</Text>
      <TextInput
        value={valor}
        onChangeText={alCambiarTexto}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        textContentType={textContentType}
        autoComplete={autoComplete}
        placeholderTextColor="#9b8f7f"
        selectionColor="#7c2d12"
        style={{
          borderWidth: 1,
          borderColor: mensajeError ? "#c84f4f" : "#d9ccb3",
          backgroundColor: "#fff",
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          color: "#16283c"
        }}
      />
      {mensajeError ? <Text style={{ color: "#b23b3b", fontSize: 13 }}>{mensajeError}</Text> : null}
    </View>
  );
}
