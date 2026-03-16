import React from "react"
import ContentLoader, { Rect } from "react-content-loader/native"
import { View, StyleSheet } from "react-native";

export const JobCardSkeleton = () => (
  <View style={s.card}>
    <ContentLoader 
      speed={2}
      width={320}
      height={120}
      viewBox="0 0 320 120"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
    >
      <Rect x="58" y="8" rx="3" ry="3" width="180" height="16" /> 
      <Rect x="58" y="32" rx="3" ry="3" width="100" height="12" /> 
      <Rect x="0" y="8" rx="8" ry="8" width="48" height="48" /> 
      <Rect x="0" y="70" rx="10" ry="10" width="80" height="20" />
      <Rect x="90" y="70" rx="10" ry="10" width="80" height="20" />
    </ContentLoader>
  </View>
)

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
});
