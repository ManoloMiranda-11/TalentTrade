import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useState, type ChangeEvent } from "react";
import { Platform, Pressable, Text } from "react-native";

type ModoSelector = "date" | "time";

type PropiedadesSelectorTemporal = {
  modo: ModoSelector;
  valor: Date;
  alCambiar: (fecha: Date) => void;
  fechaMinima?: Date;
};

function dosDigitos(numero: number) {
  return numero.toString().padStart(2, "0");
}

function formatearEtiqueta(fecha: Date, modo: ModoSelector) {
  if (modo === "date") {
    return fecha.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  return fecha.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function aTextoInput(fecha: Date, modo: ModoSelector) {
  if (modo === "date") {
    return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
  }

  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

function combinarConSeleccion(base: Date, seleccionada: Date, modo: ModoSelector) {
  const combinada = new Date(base);

  if (modo === "date") {
    combinada.setFullYear(seleccionada.getFullYear(), seleccionada.getMonth(), seleccionada.getDate());
  } else {
    combinada.setHours(seleccionada.getHours(), seleccionada.getMinutes(), 0, 0);
  }

  return combinada;
}

function combinarConTexto(base: Date, texto: string, modo: ModoSelector) {
  const combinada = new Date(base);

  if (modo === "date") {
    const [anio, mes, dia] = texto.split("-").map(Number);
    combinada.setFullYear(anio, mes - 1, dia);
  } else {
    const [horas, minutos] = texto.split(":").map(Number);
    combinada.setHours(horas, minutos, 0, 0);
  }

  return combinada;
}

export function SelectorTemporal({ modo, valor, alCambiar, fechaMinima }: PropiedadesSelectorTemporal) {
  const [mostrarPicker, setMostrarPicker] = useState(false);

  // En web el componente nativo no se muestra, así que usamos el selector propio del navegador.
  if (Platform.OS === "web") {
    function manejarCambioWeb(evento: ChangeEvent<HTMLInputElement>) {
      const texto = evento.target.value;
      if (!texto) {
        return;
      }

      alCambiar(combinarConTexto(valor, texto, modo));
    }

    return (
      <input
        type={modo}
        value={aTextoInput(valor, modo)}
        min={modo === "date" && fechaMinima ? aTextoInput(fechaMinima, "date") : undefined}
        onChange={manejarCambioWeb}
        style={{
          borderWidth: 1,
          borderStyle: "solid",
          borderColor: "#d8c9ac",
          borderRadius: 16,
          backgroundColor: "#fff",
          padding: 14,
          color: "#16283c",
          fontWeight: 600,
          fontSize: 15,
          fontFamily: "inherit",
          width: "100%",
          boxSizing: "border-box"
        }}
      />
    );
  }

  function manejarCambioNativo(evento: DateTimePickerEvent, seleccionada?: Date) {
    if (Platform.OS !== "ios") {
      setMostrarPicker(false);
    }

    if (evento.type === "set" && seleccionada) {
      alCambiar(combinarConSeleccion(valor, seleccionada, modo));
    }
  }

  return (
    <>
      <Pressable
        onPress={() => setMostrarPicker(true)}
        style={{
          borderWidth: 1,
          borderColor: "#d8c9ac",
          borderRadius: 16,
          backgroundColor: "#fff",
          paddingHorizontal: 14,
          paddingVertical: 14
        }}
      >
        <Text style={{ color: "#16283c", fontWeight: "600" }}>{formatearEtiqueta(valor, modo)}</Text>
      </Pressable>

      {mostrarPicker ? (
        <DateTimePicker
          value={valor}
          mode={modo}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={modo === "date" ? fechaMinima : undefined}
          is24Hour
          onChange={manejarCambioNativo}
        />
      ) : null}
    </>
  );
}
