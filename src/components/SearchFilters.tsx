import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/colors';
import { useLanguage } from '../i18n/LanguageContext';

interface SearchFiltersProps {
  wards: string[];
  booths: string[];
  selectedWard: string;
  selectedBooth: string;
  selectedGender: string;
  selectedVoted: string;
  onWardChange: (ward: string) => void;
  onBoothChange: (booth: string) => void;
  onGenderChange: (gender: string) => void;
  onVotedChange: (voted: string) => void;
  onClearFilters: () => void;
}

export default function SearchFilters({
  wards,
  booths,
  selectedWard,
  selectedBooth,
  selectedGender,
  selectedVoted,
  onWardChange,
  onBoothChange,
  onGenderChange,
  onVotedChange,
  onClearFilters,
}: SearchFiltersProps) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const hasActiveFilters =
    selectedWard !== '' ||
    selectedBooth !== '' ||
    selectedGender !== '' ||
    selectedVoted !== '';

  return (
    <View style={styles.container}>
      {/* Toggle Button */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.toggleLeft}>
          <Ionicons
            name="filter"
            size={16}
            color={hasActiveFilters ? Colors.accent : Colors.textSecondary}
          />
          <Text
            style={[
              styles.toggleText,
              hasActiveFilters && styles.toggleTextActive,
            ]}
          >
            {t.advancedFilters}
          </Text>
          {hasActiveFilters && (
            <View style={styles.activeIndicator}>
              <Text style={styles.activeIndicatorText}>!</Text>
            </View>
          )}
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={Colors.textSecondary}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.filtersContainer}>
          {/* Ward Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>{t.fieldWard}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}
            >
              <TouchableOpacity
                style={[styles.chip, selectedWard === '' && styles.chipSelected]}
                onPress={() => onWardChange('')}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedWard === '' && styles.chipTextSelected,
                  ]}
                >
                  {t.allWards}
                </Text>
              </TouchableOpacity>
              {wards.map((ward) => (
                <TouchableOpacity
                  key={ward}
                  style={[
                    styles.chip,
                    selectedWard === ward && styles.chipSelected,
                  ]}
                  onPress={() => onWardChange(ward)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedWard === ward && styles.chipTextSelected,
                    ]}
                  >
                    {ward}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Booth Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>{t.fieldBoothNo}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}
            >
              <TouchableOpacity
                style={[
                  styles.chip,
                  selectedBooth === '' && styles.chipSelected,
                ]}
                onPress={() => onBoothChange('')}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedBooth === '' && styles.chipTextSelected,
                  ]}
                >
                  {t.allBooths}
                </Text>
              </TouchableOpacity>
              {booths.map((booth) => (
                <TouchableOpacity
                  key={booth}
                  style={[
                    styles.chip,
                    selectedBooth === booth && styles.chipSelected,
                  ]}
                  onPress={() => onBoothChange(booth)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedBooth === booth && styles.chipTextSelected,
                    ]}
                  >
                    {booth}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Gender Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>{t.fieldAgeGender}</Text>
            <View style={styles.chipRow}>
              {[
                { value: '', label: t.allGenders },
                { value: 'M', label: t.male },
                { value: 'F', label: t.female },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    selectedGender === opt.value && styles.chipSelected,
                  ]}
                  onPress={() => onGenderChange(opt.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedGender === opt.value && styles.chipTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Voted Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>{t.fieldVoted}</Text>
            <View style={styles.chipRow}>
              {[
                { value: '', label: t.allVotedStatus },
                { value: 'Yes', label: t.votedYes },
                { value: 'No', label: t.votedNo },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.chip,
                    selectedVoted === opt.value && styles.chipSelected,
                  ]}
                  onPress={() => onVotedChange(opt.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedVoted === opt.value && styles.chipTextSelected,
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={onClearFilters}
            >
              <Ionicons name="close-circle" size={16} color={Colors.error} />
              <Text style={styles.clearText}>{t.clearFilters}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  toggleText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: Colors.accent,
  },
  activeIndicator: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.round,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicatorText: {
    color: Colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
  },
  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  filterGroup: {
    marginTop: Spacing.md,
  },
  filterLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipScroll: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  chip: {
    backgroundColor: Colors.chipBackground,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: Colors.chipSelected,
    borderColor: Colors.chipSelected,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.chipText,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: Colors.chipSelectedText,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  clearText: {
    fontSize: FontSize.sm,
    color: Colors.error,
    fontWeight: '500',
  },
});
