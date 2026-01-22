import React, { useState, useEffect } from 'react';
import { View, Text, Platform, Alert } from 'react-native';
import { getUserPortfolios, deletePortfolioItem } from '../../services/portfolio';
import { getCurrentUser } from '../../services/auth';
import Button from '../common/Button';
import SecondaryButton from '../common/SecondaryButton';
import PortfolioItemCard from './PortfolioItemCard';
import PortfolioModal from './PortfolioModal';
import { colors } from '../../styles/theme';
import { globalStyles } from '../../styles/globalStyles';

const PortfolioSection = ({ userUID, isOwnProfile = false, navigation, maxDisplay = 6 }) => {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    Platform.OS === 'web' ? window.innerWidth : 768
  );

  useEffect(() => {
    loadPortfolioItems();

    if (Platform.OS === 'web') {
      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [userUID]);

  const isDesktop = screenWidth >= 1024;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isMobile = screenWidth < 768;

  const loadPortfolioItems = async () => {
    try {
      setLoading(true);
      const items = await getUserPortfolios(userUID, 50);
      setPortfolioItems(items);
    } catch (error) {
      console.error('Error loading portfolio items:', error);
      if (isOwnProfile) {
        Alert.alert('Error', 'Failed to load your portfolio items');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleItemPress = (item) => {
    const index = portfolioItems.findIndex(portfolio => portfolio.id === item.id);
    setSelectedItem(item);
    setSelectedIndex(index);
    setModalVisible(true);
  };

  const handleNavigateModal = (newIndex) => {
    if (newIndex >= 0 && newIndex < portfolioItems.length) {
      setSelectedIndex(newIndex);
      setSelectedItem(portfolioItems[newIndex]);
    }
  };

  const handleCreatePortfolio = () => {
    if (navigation) {
      navigation.navigate('CreatePortfolio');
    }
  };

  const handleAddMorePortfolio = () => {
    if (navigation) {
      navigation.navigate('CreatePortfolio');
    }
  };

  const handleEditPortfolio = (portfolioItem) => {
    if (navigation) {
      navigation.navigate('CreatePortfolio', {
        portfolioId: portfolioItem.id,
        mode: 'edit'
      });
    }
  };

  const handleDeletePortfolio = async (portfolioItem) => {
    const confirmDelete = () => {
      return new Promise((resolve) => {
        if (Platform.OS === 'web') {
          const confirmed = window.confirm(`Are you sure you want to delete "${portfolioItem.title}"?`);
          resolve(confirmed);
        } else {
          Alert.alert(
            'Delete Portfolio Item',
            `Are you sure you want to delete "${portfolioItem.title}"?`,
            [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Delete', style: 'destructive', onPress: () => resolve(true) }
            ]
          );
        }
      });
    };

    try {
      const confirmed = await confirmDelete();
      if (confirmed) {
        await deletePortfolioItem(portfolioItem.id);

        // Reload portfolio items
        await loadPortfolioItems();

        // Show success message
        if (Platform.OS === 'web') {
          alert('Portfolio item deleted successfully!');
        } else {
          Alert.alert('Success', 'Portfolio item deleted successfully!');
        }
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      if (Platform.OS === 'web') {
        alert('Failed to delete portfolio item. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to delete portfolio item. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <View style={globalStyles.card}>
        <Text style={globalStyles.bodyText}>Loading portfolio...</Text>
      </View>
    );
  }

  // Empty state for own profile
  if (isOwnProfile && portfolioItems.length === 0) {
    return (
      <View style={globalStyles.card}>
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>
            Showcase your work on MyThirdPlace!
          </Text>
          <Text style={styles.emptyStateDescription}>
            Put together a portfolio of your work for other users to see!
          </Text>
          <Button onPress={handleCreatePortfolio} style={styles.emptyStateButton}>
            Add Your First Portfolio Item
          </Button>
        </View>
      </View>
    );
  }

  // Don't show empty portfolio for other users
  if (!isOwnProfile && portfolioItems.length === 0) {
    return null;
  }

  const displayItems = portfolioItems.slice(0, maxDisplay);
  const hasMore = portfolioItems.length > maxDisplay;

  return (
    <>
      <View style={globalStyles.card}>
        <View style={styles.headerContainer}>
          <Text style={globalStyles.heading3}>
            Portfolio ({portfolioItems.length})
          </Text>
        </View>

        <View style={[
          styles.portfolioGrid,
          isMobile ? styles.portfolioGridMobile :
          isTablet ? styles.portfolioGridTablet : styles.portfolioGridDesktop
        ]}>
          {displayItems.map((item) => (
            <View key={item.id} style={[
              styles.gridItem,
              isMobile ? styles.gridItemMobile :
              isTablet ? styles.gridItemTablet : styles.gridItemDesktop
            ]}>
              <PortfolioItemCard
                portfolioItem={item}
                onPress={handleItemPress}
                isOwnProfile={isOwnProfile}
                onEdit={handleEditPortfolio}
                onDelete={handleDeletePortfolio}
              />
            </View>
          ))}
        </View>

        {isOwnProfile && portfolioItems.length > 0 && (
          <SecondaryButton onPress={handleAddMorePortfolio} style={styles.addMoreButton}>
            Add Portfolio Item
          </SecondaryButton>
        )}

        {hasMore && (
          <Button
            onPress={() => Alert.alert('Coming Soon', 'View all portfolio items feature coming soon!')}
            style={styles.viewAllButton}
          >
            View All Portfolio Items ({portfolioItems.length})
          </Button>
        )}
      </View>

      {/* Portfolio Modal */}
      <PortfolioModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        portfolioItem={selectedItem}
        portfolioItems={portfolioItems}
        currentIndex={selectedIndex}
        onNavigate={handleNavigateModal}
      />
    </>
  );
};

const styles = {
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  addMoreButton: {
    marginTop: 20,
    alignSelf: 'center'
  },
  emptyStateContainer: {
    alignItems: 'center',
    textAlign: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center'
  },
  emptyStateDescription: {
    fontSize: 16,
    color: colors.darkGrey,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22
  },
  emptyStateButton: {
    minWidth: 200
  },
  portfolioGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start'
  },
  portfolioGridDesktop: {
    gap: 20
  },
  portfolioGridTablet: {
    gap: 16
  },
  portfolioGridMobile: {
    gap: 12
  },
  gridItem: {
    flexGrow: 0,
    flexShrink: 0
  },
  gridItemDesktop: {
    width: 'calc(33.333% - 14px)',
    minWidth: 280
  },
  gridItemTablet: {
    width: 'calc(50% - 8px)',
    minWidth: 250
  },
  gridItemMobile: {
    width: '100%'
  },
  viewAllButton: {
    marginTop: 20,
    alignSelf: 'center'
  }
};

export default PortfolioSection;