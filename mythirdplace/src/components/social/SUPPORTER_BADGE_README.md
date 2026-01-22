# Supporter Badge - Community Level Enhancement

## Overview

The MyThirdPlace platform now features a special **Supporter** badge for users who were migrated from the original platform. This badge takes priority over all other community levels and includes a distinctive shine effect on web.

## Features

### Visual Design
- **Color**: Gold (#FFD700) with light cream background (#FFFACD)
- **Icon**: ⭐ (Star emoji)
- **Label**: "Supporter"
- **Description**: "Early platform supporter"

### Special Effects
- **Web**: Animated shine effect with subtle box shadow
- **Mobile**: Enhanced golden border with shadow

### Priority System
Migrated users (`isMigratedUser: true`) will **always** display the Supporter badge, regardless of their activity level. This ensures loyal early users are permanently recognized.

## Usage

```javascript
import CommunityLevel from '../social/CommunityLevel';

// For migrated user (will show Supporter badge)
<CommunityLevel
  regularVenuesCount={10}
  createdVenuesCount={5}
  publishedBlogsCount={3}
  isMigratedUser={true}  // This ensures Supporter badge shows
  size="normal"
  showDescription={true}
/>

// For new user (will show level based on activity)
<CommunityLevel
  regularVenuesCount={1}
  createdVenuesCount={0}
  publishedBlogsCount={0}
  isMigratedUser={false}  // Will show "Newcomer" badge
  size="normal"
  showDescription={true}
/>
```

## Integration Points

The `isMigratedUser` prop should be passed from the user's profile data:

### 1. ProfileHeader Component
```javascript
<CommunityLevel
  regularVenuesCount={socialStats.regularVenuesCount || 0}
  createdVenuesCount={socialStats.createdVenuesCount || 0}
  publishedBlogsCount={socialStats.publishedBlogsCount || 0}
  isMigratedUser={profile?.isMigratedUser || false}
  size="small"
  showDescription={false}
/>
```

### 2. VenueDetailScreen Component
```javascript
<CommunityLevel
  regularVenuesCount={creatorSocialStats.regularVenuesCount}
  createdVenuesCount={creatorSocialStats.createdVenuesCount}
  publishedBlogsCount={creatorSocialStats.publishedBlogsCount}
  isMigratedUser={creator?.isMigratedUser || false}
  size="small"
  showDescription={false}
/>
```

## Migration Data

Users migrated via the `scripts/migrateUsers.js` script automatically receive:
- `isMigratedUser: true` flag in their Firestore profile
- `badges: ['Supporter']` array (for additional badge system)
- Original registration dates preserved

## Badge Hierarchy

1. **Supporter** (migrated users only) - Takes absolute priority
2. **Community Ambassador** (25+ total activity)
3. **Contributor** (10-24 total activity)
4. **Regular Member** (3-9 total activity)
5. **Newcomer** (0-2 total activity)

## Technical Implementation

### CSS Animation (Web Only)
```css
@keyframes shine {
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
}
```

### Shine Effect Properties
- **Duration**: 3 seconds
- **Repeat**: Infinite
- **Background**: Linear gradient sweep
- **Shadow**: Golden glow effect

### React Native Enhancements
- **Border Width**: 2px (vs 1px for other badges)
- **Shadow**: Golden shadow with elevation
- **Border Color**: Full opacity gold

## Future Considerations

- Badge system could be expanded with additional special recognitions
- Animation timing could be customized per badge type
- Additional visual effects could be added for other special user types

This enhancement ensures that early supporters of MyThirdPlace are permanently recognized for their contribution to the community's foundation.