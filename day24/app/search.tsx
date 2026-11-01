import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useTheme } from '@/hooks/useTheme';
import { spacing, typography } from '@/lib/theme';
import { useActivityStore } from '@/store/activityStore';
import { formatDuration, formatShortDate } from '@/utils/time';
import type { Activity } from '@/types';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { search } = useActivityStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await search(text);
      setResults(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.searchBox}>
        <Input
          value={query}
          onChangeText={handleSearch}
          placeholder="Search activities..."
          autoFocus
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <Text style={[styles.empty, { color: colors.textMuted }]}>No results found</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.result}>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {formatShortDate(item.start_time)}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.duration, { color: colors.textSecondary }]}>
              {formatDuration(item.duration_minutes)}
              {item.category && ` · ${item.category.icon} ${item.category.name}`}
            </Text>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: { padding: spacing.lg },
  list: { padding: spacing.lg, paddingTop: 0 },
  result: { marginBottom: spacing.md },
  date: { ...typography.small, marginBottom: spacing.xs },
  title: { ...typography.bodyBold },
  duration: { ...typography.caption, marginTop: spacing.xs },
  empty: { ...typography.body, textAlign: 'center', marginTop: spacing.xxxl },
});
