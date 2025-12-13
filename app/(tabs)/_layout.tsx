import { Tabs } from "expo-router";
import { Home, CheckSquare, FileText, Calculator, BookOpen } from "lucide-react-native";
import React from "react";
import { useColors } from "@/contexts/ThemeContext";

export default function TabLayout() {
  const colors = useColors();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500' as const,
          marginBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="checklist"
        options={{
          title: "Checklist",
          tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: "Documentos",
          tabBarIcon: ({ color, size }) => <FileText color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: "Multas",
          tabBarIcon: ({ color, size }) => <Calculator color={color} size={size - 2} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Aprender",
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size - 2} />,
        }}
      />
    </Tabs>
  );
}
