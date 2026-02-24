import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Voter, SearchFilters as SearchFiltersType } from '../../src/types/voter';
import {
  searchVoters,
  getDistinctWards,
  getDistinctBooths,
  getVoterCount,
} from '../../src/database/database';
import VoterCard from '../../src/components/VoterCard';
import VoterDetailModal from '../../src/components/VoterDetailModal';
import SearchFilters from '../../src/components/SearchFilters';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/theme/colors';
import { useLanguage } from '../../src/i18n/LanguageContext';

const PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 400;

export default function SearchScreen() {
  const { t, language, toggleLanguage } = useLanguage();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedBooth, setSelectedBooth] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedVoted, setSelectedVoted] = useState('');

  // Data state
  const [voters, setVoters] = useState<Voter[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalVoters, setTotalVoters] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filter options
  const [wards, setWards] = useState<string[]>([]);
  const [booths, setBooths] = useState<string[]>([]);

  // Modal
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Debounce timer
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    searchTimer.current = setTimeout(() => {
      performSearch(true);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchQuery, selectedWard, selectedBooth, selectedGender, selectedVoted]);

  const loadFilterOptions = async () => {
    try {
      const [wardList, boothList, count] = await Promise.all([
        getDistinctWards(),
        getDistinctBooths(),
        getVoterCount(),
      ]);
      setWards(wardList);
      setBooths(boothList);
      setTotalVoters(count);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const performSearch = async (reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(0);
      }

      const offset = reset ? 0 : page * PAGE_SIZE;
      const filters: SearchFiltersType = {
        query: searchQuery,
        ward: selectedWard,
        booth_no: selectedBooth,
        gender: selectedGender,
        voted: selectedVoted,
      };

      const result = await searchVoters(filters, PAGE_SIZE, offset);

      if (reset) {
        setVoters(result.voters);
      } else {
        setVoters((prev) => [...prev, ...result.voters]);
      }

      setTotalCount(result.totalCount);
      setHasMore(result.voters.length === PAGE_SIZE);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    setPage((prev) => {
      const newPage = prev + 1;
      // Trigger search with new offset
      setTimeout(() => {
        const offset = newPage * PAGE_SIZE;
        const filters: SearchFiltersType = {
          query: searchQuery,
          ward: selectedWard,
          booth_no: selectedBooth,
          gender: selectedGender,
          voted: selectedVoted,
        };
        searchVoters(filters, PAGE_SIZE, offset).then((result) => {
          setVoters((prev) => [...prev, ...result.voters]);
          setHasMore(result.voters.length === PAGE_SIZE);
          setLoadingMore(false);
        });
      }, 0);
      return newPage;
    });
  }, [hasMore, loadingMore, loading, searchQuery, selectedWard, selectedBooth, selectedGender, selectedVoted]);

  const handleVoterPress = (voter: Voter) => {
    setSelectedVoter(voter);
    setModalVisible(true);
  };

  const handleClearFilters = () => {
    setSelectedWard('');
    setSelectedBooth('');
    setSelectedGender('');
    setSelectedVoted('');
  };

  const handleVoterUpdated = () => {
    performSearch(true);
  };

  const renderVoterItem = useCallback(
    ({ item, index }: { item: Voter; index: number }) => (
      <VoterCard voter={item} index={index} onPress={handleVoterPress} />
    ),
    []
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator color={Colors.primary} size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    const isNoData = totalVoters === 0;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name={isNoData ? 'document-outline' : 'search-outline'}
          size={64}
          color={Colors.textLight}
        />
        <Text style={styles.emptyTitle}>
          {isNoData ? t.noData : t.noResults}
        </Text>
        <Text style={styles.emptyHint}>
          {isNoData ? t.noDataHint : t.noResultsHint}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>{t.searchTitle}</Text>
            <Text style={styles.headerSubtitle}>
              {t.totalRecords}: {totalVoters.toLocaleString()}
            </Text>
          </View>
          <TouchableOpacity
            onPress={toggleLanguage}
            style={styles.langButton}
          >
            <Ionicons name="language" size={18} color={Colors.textOnPrimary} />
            <Text style={styles.langButtonText}>
              {language === 'mr' ? 'EN' : 'मरा'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchPlaceholder}
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <SearchFilters
        wards={wards}
        booths={booths}
        selectedWard={selectedWard}
        selectedBooth={selectedBooth}
        selectedGender={selectedGender}
        selectedVoted={selectedVoted}
        onWardChange={setSelectedWard}
        onBoothChange={setSelectedBooth}
        onGenderChange={setSelectedGender}
        onVotedChange={setSelectedVoted}
        onClearFilters={handleClearFilters}
      />

      {/* Results count */}
      {!loading && voters.length > 0 && (
        <View style={styles.resultsBar}>
          <Text style={styles.resultsText}>
            {t.resultsCount}: {totalCount.toLocaleString()}
          </Text>
        </View>
      )}

      {/* Loading indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
      )}

      {/* Results list */}
      {!loading && (
        <FlatList
          data={voters}
          renderItem={renderVoterItem}
          keyExtractor={(item) => item.id.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={7}
        />
      )}

      {/* Voter Detail Modal */}
      <VoterDetailModal
        voter={selectedVoter}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onVoterUpdated={handleVoterUpdated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 48,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textOnPrimary + 'AA',
    marginTop: 2,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  langButtonText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  resultsBar: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  resultsText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingVertical: Spacing.sm,
    paddingBottom: 20,
    flexGrow: 1,
  },
  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: FontSize.md,
    color: Colors.textLight,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
