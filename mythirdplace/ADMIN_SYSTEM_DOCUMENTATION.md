# MyThirdPlace Admin System Documentation

## Overview

The MyThirdPlace Admin System is a comprehensive Content Management System (CMS) built with a WordPress-inspired design. It provides full control over users, content, SEO, and platform settings.

## Access Information

### Admin Login URL
```
http://localhost:8081/admin-dashboard
```

### Default Admin Accounts

**Account 1:**
- Email: `charlielfisher@hotmail.com`
- Password: `1Pennymoo!`
- Role: Super Admin

**Account 2:**
- Email: `joshuachan@mythirdplace.co.uk`
- Password: `AdminSecure2024!`
- Role: Super Admin

## Features Overview

### 1. Dashboard (Home)
**Route:** `/admin-dashboard/home`

The main dashboard provides:
- Platform statistics (total users, venues, blogs)
- Quick action buttons for common tasks
- Overview widgets showing recent activity

### 2. User Management
**Route:** `/admin-dashboard/users`

Full user management capabilities:
- **View all users** with search and filter
- **Edit user information** (name, email, bio)
- **View user content** (their venues and blogs)
- **Delete user accounts** with confirmation
- Search users by name or email

**Actions available:**
- Edit: Modify user profile information
- Content: View all venues and blogs created by the user
- Delete: Remove user account (requires confirmation)

### 3. Venue Management
**Route:** `/admin-dashboard/venues`

Complete venue listing control:
- **View all venues** in table format
- **Edit venue details** (name, category, description)
- **Delete venues** with confirmation
- **View venue pages** directly from admin
- Search venues by name or category

**Editable fields:**
- Venue name
- Category
- Description
- Location information

### 4. Blog Management
**Route:** `/admin-dashboard/blogs`

Full blog content control:
- **View all blog posts** in table format
- **Edit blog metadata** (title, category)
- **Delete blog posts** with confirmation
- **View published blogs** directly from admin
- Search blogs by title or category

**Editable fields:**
- Blog title
- Category
- Publication date

### 5. Page Content Editor
**Route:** `/admin-dashboard/content`

Edit content for main pages:

**Homepage Hero Section:**
- Hero Title
- Hero Subtitle
- Hero Description

**About Page:**
- Page Title
- About Content (full text)

**Contact Information:**
- Contact Email
- Contact Phone

All changes are saved to Firebase and reflected immediately on the public site.

### 6. SEO Settings
**Route:** `/admin-dashboard/seo`

Manage meta tags for all pages:
- Homepage meta title and description
- About page meta title and description
- Venues page meta title and description
- Blogs page meta title and description
- Default fallback meta tags

**Character count helpers** show optimal lengths:
- Meta Titles: 50-60 characters
- Meta Descriptions: 150-160 characters

### 7. Tags & Categories
**Route:** `/admin-dashboard/tags`

Manage taxonomy for venues and blogs:

**Venue Tags:**
- Add new custom tags
- View all existing tags
- Delete unused tags

**Venue Categories:**
- Add new categories
- View all existing categories
- Delete unused categories

### 8. Featured Venues
**Route:** `/admin-dashboard/featured`

Select venues to feature on homepage:
- **Browse all venues** with images
- **Select/deselect** venues for featuring
- **Visual indicators** showing featured status
- **Save changes** to update homepage carousel

Featured venues appear in the homepage carousel and get priority placement throughout the site.

### 9. Analytics
**Route:** `/admin-dashboard/analytics`

Platform analytics and Google Analytics integration:

**Platform Overview:**
- Total users, venues, and blogs
- Recent growth (last 7 days)
- Activity metrics

**Google Analytics Integration:**
- Enter Google Analytics Measurement ID
- Direct link to Google Analytics dashboard
- Track website visitors and behavior

**Growth Metrics:**
- New users in last 7 days
- New venues in last 7 days
- New blogs in last 7 days

## Navigation

### Sidebar Menu
The admin sidebar (visible on desktop, toggleable on mobile) includes:
- 📊 Dashboard
- 👥 Users
- 📍 Venues
- 📝 Blogs
- 📄 Page Content
- 🔍 SEO Settings
- 🏷️ Tags & Categories
- ⭐ Featured Venues
- 📈 Analytics
- 🚪 Logout

### Top Bar
- Welcome message with admin name
- Hamburger menu (mobile only)
- MyThirdPlace logo

## Mobile Responsiveness

The admin system is fully responsive:
- **Desktop (>768px):** Sidebar always visible
- **Mobile (<768px):**
  - Collapsible sidebar with hamburger menu
  - Swipe or tap to open/close
  - Overlay background when sidebar is open
  - Touch-optimized buttons and inputs

## Technical Implementation

### File Structure
```
src/
├── services/
│   └── admin.js                 # Admin service functions
├── components/
│   └── admin/
│       ├── AdminLayout.js       # Main layout wrapper
│       └── AdminSidebar.js      # Sidebar navigation
└── screens/
    └── admin/
        ├── AdminLoginScreen.js      # Login page
        ├── AdminHomeScreen.js       # Dashboard
        ├── AdminUsersScreen.js      # User management
        ├── AdminVenuesScreen.js     # Venue management
        ├── AdminBlogsScreen.js      # Blog management
        ├── AdminContentScreen.js    # Content editor
        ├── AdminSEOScreen.js        # SEO settings
        ├── AdminTagsScreen.js       # Tags & categories
        ├── AdminFeaturedScreen.js   # Featured venues
        └── AdminAnalyticsScreen.js  # Analytics
```

### Database Structure

**Admin Users Collection (`adminUsers/{email}`):**
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  role: "super_admin",
  permissions: {
    canViewUsers: boolean,
    canEditUsers: boolean,
    canDeleteUsers: boolean,
    canModerateVenues: boolean,
    canEditVenues: boolean,
    canModerateBlogs: boolean,
    canEditBlogs: boolean,
    canManageFeatured: boolean,
    canManageCategories: boolean,
    canManageTags: boolean,
    canEditSettings: boolean,
    canViewAnalytics: boolean,
  },
  createdAt: timestamp,
  lastLogin: timestamp,
  isActive: boolean
}
```

**System Settings Collection (`systemSettings/{key}`):**
```javascript
{
  value: any,
  updatedAt: timestamp
}
```

Settings keys include:
- `homeHeroTitle`, `homeHeroSubtitle`, `homeHeroDescription`
- `aboutTitle`, `aboutContent`
- `contactEmail`, `contactPhone`
- `homeMetaTitle`, `homeMetaDescription`
- `aboutMetaTitle`, `aboutMetaDescription`
- `venuesMetaTitle`, `venuesMetaDescription`
- `blogsMetaTitle`, `blogsMetaDescription`
- `featuredVenues` (array of venue IDs)
- `googleAnalyticsId`

## Security Features

1. **Authentication Required:** All admin routes check for authenticated admin users
2. **Role-Based Access:** Only users in `adminUsers` collection can access admin panel
3. **Confirmation Dialogs:** Destructive actions (delete) require confirmation
4. **Session Management:** Admin sessions tracked with lastLogin timestamps
5. **Firestore Rules:** Proper security rules should be set to protect admin operations

## Common Tasks

### Adding a New Admin User
1. Use Firebase Console or admin service to add to `adminUsers` collection
2. Create Firebase Auth account with email/password
3. Set appropriate permissions in the document

### Changing Homepage Content
1. Navigate to Page Content (`/admin-dashboard/content`)
2. Edit Homepage Hero Section fields
3. Click "Save All Changes"

### Managing Featured Venues
1. Navigate to Featured Venues (`/admin-dashboard/featured`)
2. Click on venues to toggle featured status (checkbox appears)
3. Click "Save Changes" to update homepage

### Setting Up Google Analytics
1. Get your GA Measurement ID from Google Analytics
2. Navigate to Analytics (`/admin-dashboard/analytics`)
3. Enter the Measurement ID (format: G-XXXXXXXXXX)
4. Click "Save Analytics ID"

### Editing SEO Meta Tags
1. Navigate to SEO Settings (`/admin-dashboard/seo`)
2. Edit meta title and description for each page
3. Watch character counters to stay within optimal ranges
4. Click "Save All SEO Settings"

### Managing Users
1. Navigate to Users (`/admin-dashboard/users`)
2. Use search bar to find specific users
3. Click "Edit" to modify user information
4. Click "Content" to see user's venues and blogs
5. Click "Delete" to remove user (with confirmation)

### Moderating Content
1. **For Venues:** Navigate to Venues, search, edit or delete as needed
2. **For Blogs:** Navigate to Blogs, search, edit or delete as needed
3. Click "View" to see the public page before making decisions

## Support and Maintenance

### Regular Tasks
- Monitor user growth in Analytics
- Update featured venues monthly
- Review and moderate new content
- Check SEO settings quarterly
- Update page content as needed

### Troubleshooting
- **Can't login:** Check email/password, verify account is in `adminUsers`
- **Changes not appearing:** Clear browser cache, check Firebase connection
- **Mobile sidebar stuck:** Refresh page or tap overlay to close
- **Table not scrolling:** Use horizontal scroll or switch to desktop view

## Future Enhancements

Potential additions:
- User suspension (ban/unban)
- Content approval workflow
- Bulk operations
- Export data functionality
- Activity log/audit trail
- Email notifications
- Advanced analytics charts
- Image management tools
- Comment moderation

## Development Notes

The admin system is built with:
- React Native Web for cross-platform compatibility
- Firebase for backend services
- Responsive design principles
- WordPress-inspired UI/UX patterns
- Mobile-first approach

All admin screens use the `AdminLayout` component which provides consistent navigation and responsive behavior across all pages.

## Version Information
- **Version:** 1.0
- **Last Updated:** 2025-10-10
- **Compatible with:** MyThirdPlace Platform v1.0+
