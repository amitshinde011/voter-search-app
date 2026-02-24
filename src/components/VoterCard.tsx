import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Voter } from '../types/voter';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/colors';
import { useLanguage } from '../i18n/LanguageContext';

interface VoterCardProps {
  voter: Voter;
  index: number;
  onPress: (voter: Voter) => void;
}

export default function VoterCard({ voter, index, onPress }: VoterCardProps) {
  const { t } = useLanguage();

  // Parse age and gender from age_gender field (e.g. "51 M" or "61 F")
  const ageGenderParts = voter.age_gender?.split(' ') ?? [];
  const age = ageGenderParts[0] ?? '';
  const gender = ageGenderParts[1] ?? '';
  const isMale = gender.toUpperCase() === 'M';
  const genderColor = isMale ? Colors.male : Colors.female;
  const genderIcon = isMale ? 'male' : 'female';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(voter)}
      activeOpacity={0.7}
    >
      {/* Top row: Sr.No badge + Name */}
      <View style={styles.topRow}>
        <View style={styles.srBadge}>
          <Text style={styles.srText}>{voter.sr_no}</Text>
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={2}>
            {voter.name}
          </Text>
          <Text style={styles.voterCard}>
            <Ionicons name="card-outline" size={12} color={Colors.textSecondary} />
            {'  '}{voter.voter_card_no}
          </Text>
        </View>
        <View style={[styles.genderBadge, { backgroundColor: genderColor + '20' }]}>
          <Ionicons name={genderIcon} size={14} color={genderColor} />
          <Text style={[styles.genderText, { color: genderColor }]}>
            {age}
          </Text>
        </View>
      </View>

      {/* Info chips */}
      <View style={styles.chipRow}>
        {voter.ward ? (
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>{t.fieldWard}</Text>
            <Text style={styles.chipValue}>{voter.ward}</Text>
          </View>
        ) : null}
        {voter.booth_no ? (
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>{t.fieldBoothNo}</Text>
            <Text style={styles.chipValue}>{voter.booth_no}</Text>
          </View>
        ) : null}
        {voter.house_no ? (
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>{t.fieldHouseNo}</Text>
            <Text style={styles.chipValue} numberOfLines={1}>{voter.house_no}</Text>
          </View>
        ) : null}
        {voter.voted === 'Yes' && (
          <View style={[styles.chip, styles.votedChip]}>
            <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
            <Text style={[styles.chipValue, { color: Colors.success }]}>{t.fieldVoted}</Text>
          </View>
        )}
      </View>

      {/* Address */}
      {voter.address ? (
        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.address} numberOfLines={2}>
            {voter.address}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  srBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    minWidth: 36,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  srText: {
    color: Colors.textOnPrimary,
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  nameContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    lineHeight: 22,
  },
  voterCard: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  genderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: 3,
  },
  genderText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.chipBackground,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs,
    gap: 4,
  },
  votedChip: {
    backgroundColor: Colors.successLight,
  },
  chipLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  chipValue: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.chipText,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  address: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
