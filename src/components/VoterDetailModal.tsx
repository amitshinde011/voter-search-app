import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Voter } from '../types/voter';
import { Colors, Spacing, FontSize, BorderRadius } from '../theme/colors';
import { useLanguage } from '../i18n/LanguageContext';
import { printVoter } from '../services/printService';
import { updatePrintedStatus, getFamilyMembers } from '../database/database';

interface VoterDetailModalProps {
  voter: Voter | null;
  visible: boolean;
  onClose: () => void;
  onVoterUpdated?: () => void;
}

interface FieldItem {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export default function VoterDetailModal({
  voter,
  visible,
  onClose,
  onVoterUpdated,
}: VoterDetailModalProps) {
  const { t } = useLanguage();
  const [printing, setPrinting] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<Voter[]>([]);
  const [showFamily, setShowFamily] = useState(false);

  if (!voter) return null;

  const fields: FieldItem[] = [
    { label: t.fieldWard, value: voter.ward, icon: 'grid-outline' },
    { label: t.fieldBoothNo, value: voter.booth_no, icon: 'business-outline' },
    { label: t.fieldSrNo, value: voter.sr_no, icon: 'list-outline' },
    { label: t.fieldName, value: voter.name, icon: 'person-outline' },
    { label: t.fieldVoterCard, value: voter.voter_card_no, icon: 'card-outline' },
    { label: t.fieldAddress, value: voter.address, icon: 'location-outline' },
    { label: t.fieldVotingCenter, value: voter.voting_center, icon: 'home-outline' },
    { label: t.fieldHouseNo, value: voter.house_no, icon: 'key-outline' },
    { label: t.fieldAgeGender, value: voter.age_gender, icon: 'people-outline' },
    { label: t.fieldColor, value: voter.color_code, icon: 'color-palette-outline' },
    { label: t.fieldMobile1, value: voter.mobile1, icon: 'call-outline' },
    { label: t.fieldMobile2, value: voter.mobile2, icon: 'call-outline' },
    { label: t.fieldNewAddress, value: voter.new_address, icon: 'navigate-outline' },
    { label: t.fieldVillage, value: voter.village, icon: 'map-outline' },
    { label: t.fieldVoted, value: voter.voted, icon: 'checkmark-circle-outline' },
    { label: t.fieldCommunity, value: voter.community, icon: 'people-circle-outline' },
    { label: t.fieldExtraInfo2, value: voter.extra_info2, icon: 'information-circle-outline' },
    { label: t.fieldArea, value: voter.area, icon: 'compass-outline' },
    { label: t.fieldResidentType, value: voter.resident_type, icon: 'home-outline' },
    { label: t.fieldExtraInfo5, value: voter.extra_info5, icon: 'information-outline' },
    { label: t.fieldEmail, value: voter.email, icon: 'mail-outline' },
    { label: t.fieldComplaint, value: voter.complaint, icon: 'alert-circle-outline' },
    { label: t.fieldSociety, value: voter.society, icon: 'business-outline' },
    { label: t.fieldExtraCheck1, value: voter.extra_check1, icon: 'checkbox-outline' },
    { label: t.fieldExtraCheck2, value: voter.extra_check2, icon: 'checkbox-outline' },
    { label: t.fieldPrinted, value: voter.printed, icon: 'print-outline' },
    { label: t.fieldFamilyId, value: voter.family_id, icon: 'people-outline' },
    { label: t.fieldAssemblyNo, value: voter.assembly_no, icon: 'document-outline' },
  ];

  const handlePrint = async () => {
    setPrinting(true);
    try {
      await printVoter(voter);
      await updatePrintedStatus(voter.id);
      Alert.alert(t.success, t.printSuccess);
      onVoterUpdated?.();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(t.error, `${t.printError}: ${msg}`);
    } finally {
      setPrinting(false);
    }
  };

  const handleShowFamily = async () => {
    if (showFamily) {
      setShowFamily(false);
      return;
    }
    if (voter.family_id) {
      const members = await getFamilyMembers(voter.family_id);
      setFamilyMembers(members.filter((m) => m.id !== voter.id));
      setShowFamily(true);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {voter.name}
            </Text>
            <Text style={styles.headerSubtitle}>
              {voter.voter_card_no} | {t.fieldSrNo}: {voter.sr_no}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePrint}
            style={styles.printButton}
            disabled={printing}
          >
            {printing ? (
              <ActivityIndicator color={Colors.textOnPrimary} size="small" />
            ) : (
              <Ionicons name="print-outline" size={22} color={Colors.textOnPrimary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {fields.map((field, index) => {
            if (!field.value || !field.value.trim()) return null;
            return (
              <View key={index} style={styles.fieldRow}>
                <View style={styles.fieldIconContainer}>
                  <Ionicons
                    name={field.icon || 'ellipse-outline'}
                    size={18}
                    color={Colors.primary}
                  />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  <Text style={styles.fieldValue}>{field.value}</Text>
                </View>
              </View>
            );
          })}

          {/* Family Members Section */}
          {voter.family_id ? (
            <View style={styles.familySection}>
              <TouchableOpacity
                style={styles.familyButton}
                onPress={handleShowFamily}
              >
                <Ionicons name="people" size={18} color={Colors.primary} />
                <Text style={styles.familyButtonText}>
                  {showFamily ? 'Hide Family Members' : 'Show Family Members'}
                </Text>
                <Ionicons
                  name={showFamily ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.primary}
                />
              </TouchableOpacity>

              {showFamily && familyMembers.length > 0 && (
                <View style={styles.familyList}>
                  {familyMembers.map((member) => (
                    <View key={member.id} style={styles.familyMember}>
                      <Text style={styles.familyName}>{member.name}</Text>
                      <Text style={styles.familyInfo}>
                        {member.age_gender} | {member.voter_card_no}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {showFamily && familyMembers.length === 0 && (
                <Text style={styles.noFamily}>No other family members found</Text>
              )}
            </View>
          ) : null}
        </ScrollView>

        {/* Bottom Print Button */}
        <TouchableOpacity
          style={styles.bottomPrintButton}
          onPress={handlePrint}
          disabled={printing}
          activeOpacity={0.8}
        >
          {printing ? (
            <ActivityIndicator color={Colors.textOnPrimary} size="small" />
          ) : (
            <>
              <Ionicons name="print" size={20} color={Colors.textOnPrimary} />
              <Text style={styles.bottomPrintText}>{t.print} / {t.voterSlip}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closeButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: Colors.textOnPrimary + 'CC',
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  printButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  fieldRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  fieldIconContainer: {
    width: 32,
    alignItems: 'center',
    paddingTop: 2,
  },
  fieldContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  fieldLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 20,
  },
  familySection: {
    marginTop: Spacing.lg,
  },
  familyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.chipBackground,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  familyButtonText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
  familyList: {
    marginTop: Spacing.sm,
  },
  familyMember: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  familyName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  familyInfo: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  noFamily: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: FontSize.sm,
    marginTop: Spacing.md,
  },
  bottomPrintButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl + 10,
    gap: Spacing.sm,
    elevation: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bottomPrintText: {
    color: Colors.textOnPrimary,
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
});
