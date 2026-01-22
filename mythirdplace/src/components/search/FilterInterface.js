import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal
} from 'react-native';
import { venueCategories } from '../../services/venue';
import { blogCategories } from '../../services/blog';
import { colors } from '../../styles/theme';

/**
 * Simplified FilterInterface Component
 * Basic filtering system with categories and sort options
 */
const FilterInterface = ({
  contentType = 'all', // 'venues', 'blogs', 'all'
  filters = {},
  onFiltersChange,
  onClearFilters,
  showAsModal = false,
  visible = true,
  onClose,
  style
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    if (onFiltersChange) {
      onFiltersChange(updatedFilters);
    }
  };

  const clearAllFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        count++;
      }
    });
    return count;
  };

  const renderCategoryFilter = () => {
    const categories = contentType === 'venues' ? venueCategories() :
                     contentType === 'blogs' ? blogCategories :
                     [...venueCategories(), ...blogCategories];

    return (
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.categoryColumn}>
          <TouchableOpacity
            style={[styles.categoryChip, (!localFilters.category || localFilters.category === 'all') && styles.activeCategoryChip]}
            onPress={() => updateFilter('category', 'all')}
          >
            <Text style={[styles.categoryChipText, (!localFilters.category || localFilters.category === 'all') && styles.activeCategoryChipText]}>All</Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryChip, localFilters.category === category.id && styles.activeCategoryChip]}
              onPress={() => updateFilter('category', category.id)}
            >
              <Text style={styles.categoryChipIcon}>{category.icon}</Text>
              <Text style={[styles.categoryChipText, localFilters.category === category.id && styles.activeCategoryChipText]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };




  const renderSortOptions = () => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>Sort By</Text>
      <View style={styles.sectionContent}>
        {[
          { key: 'relevance', label: 'Relevance', icon: '🎯' },
          { key: 'popular', label: 'Popular', icon: '🔥' },
          { key: 'recent', label: 'Recent', icon: '🆕' },
          { key: 'distance', label: 'Distance', icon: '📍' },
          { key: 'alphabetical', label: 'A-Z', icon: '🔤' }
        ].map(option => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortOption,
              localFilters.sortBy === option.key && styles.activeSortOption
            ]}
            onPress={() => updateFilter('sortBy', option.key)}
          >
            <Text style={styles.sortOptionIcon}>{option.icon}</Text>
            <Text style={[
              styles.sortOptionText,
              localFilters.sortBy === option.key && styles.activeSortOptionText
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );


  const content = (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Filters</Text>
        <View style={styles.headerActions}>
          {getActiveFilterCount() > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.filtersContainer} showsVerticalScrollIndicator={false}>
        {renderCategoryFilter()}
        {renderSortOptions()}
      </ScrollView>
    </View>
  );

  if (showAsModal) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
          </View>
          {content}
        </View>
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-end',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filtersContainer: {
    flex: 1,
  },
  filterSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  expandIcon: {
    fontSize: 14,
    color: '#666',
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  activeFilterOption: {
    backgroundColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryColumn: {
    marginBottom: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginBottom: 8,
    width: '100%',
  },
  activeCategoryChip: {
    backgroundColor: colors.primary,
  },
  categoryChipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryChipText: {
    color: '#fff',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  activeSortOption: {
    backgroundColor: colors.primary,
  },
  sortOptionIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  sortOptionText: {
    fontSize: 14,
    color: '#666',
  },
  activeSortOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default FilterInterface;