import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, typography } from '@utils/theme';

const TrackBusScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text}>Chức năng theo dõi xe đang phát triển</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.default },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  text: { ...typography.body1, color: colors.text.secondary },
});

export default TrackBusScreen;
