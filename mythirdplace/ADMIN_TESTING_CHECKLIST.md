# Admin System Testing Checklist

## Pre-Testing Setup
- [ ] Start the development server (`npm start`)
- [ ] Navigate to `http://localhost:8081/admin-dashboard`
- [ ] Verify admin users were initialized in Firebase

## 1. Authentication Testing

### Admin Login
- [ ] Navigate to `/admin-dashboard`
- [ ] Login with: `charlielfisher@hotmail.com` / `1Pennymoo!`
- [ ] Verify successful login and redirect to dashboard
- [ ] Verify admin name appears in top bar
- [ ] Logout and verify redirect to login page
- [ ] Login with second admin account: `joshuachan@mythirdplace.co.uk` / `AdminSecure2024!`
- [ ] Test incorrect credentials (should show error)
- [ ] Test "Back to Main Site" link

## 2. Dashboard & Layout Testing

### Desktop View (>768px)
- [ ] Verify sidebar is visible on left
- [ ] Verify MyThirdPlace logo in sidebar
- [ ] Verify all menu items are visible
- [ ] Verify top bar with welcome message
- [ ] Verify stats cards display correctly
- [ ] Verify quick action buttons work

### Mobile View (<768px)
- [ ] Verify sidebar is hidden by default
- [ ] Verify hamburger menu appears
- [ ] Tap hamburger to open sidebar
- [ ] Verify overlay appears behind sidebar
- [ ] Tap overlay to close sidebar
- [ ] Verify responsive layout on small screens

### Navigation
- [ ] Click each menu item and verify navigation
- [ ] Verify active menu item is highlighted
- [ ] Verify page titles update correctly

## 3. User Management Testing

- [ ] Navigate to Users page
- [ ] Verify all users display in table
- [ ] Test search functionality
- [ ] Click "Edit" on a user
  - [ ] Modify display name
  - [ ] Modify email
  - [ ] Click "Save" and verify update
  - [ ] Click "Cancel" to abort edit
- [ ] Click "Content" on a user
  - [ ] Verify popup shows venue and blog counts
- [ ] Click "Delete" on a test user
  - [ ] Verify confirmation dialog
  - [ ] Confirm deletion and verify user removed
- [ ] Test table horizontal scroll (if needed)

## 4. Venue Management Testing

- [ ] Navigate to Venues page
- [ ] Verify all venues display in table
- [ ] Test search functionality (by name and category)
- [ ] Click "Edit" on a venue
  - [ ] Modify venue name
  - [ ] Modify category
  - [ ] Modify description
  - [ ] Click "Save" and verify update
  - [ ] Click "Cancel" to abort edit
- [ ] Click "View" on a venue
  - [ ] Verify navigation to public venue page
- [ ] Click "Delete" on a test venue
  - [ ] Verify confirmation dialog
  - [ ] Confirm deletion and verify venue removed

## 5. Blog Management Testing

- [ ] Navigate to Blogs page
- [ ] Verify all blogs display in table
- [ ] Test search functionality (by title and category)
- [ ] Click "Edit" on a blog
  - [ ] Modify blog title
  - [ ] Modify category
  - [ ] Click "Save" and verify update
  - [ ] Click "Cancel" to abort edit
- [ ] Click "View" on a blog
  - [ ] Verify navigation to public blog page
- [ ] Click "Delete" on a test blog
  - [ ] Verify confirmation dialog
  - [ ] Confirm deletion and verify blog removed

## 6. Page Content Editor Testing

- [ ] Navigate to Page Content page
- [ ] Modify Homepage Hero Title
- [ ] Modify Homepage Hero Subtitle
- [ ] Modify Homepage Hero Description
- [ ] Modify About Title
- [ ] Modify About Content (longer text)
- [ ] Modify Contact Email
- [ ] Modify Contact Phone
- [ ] Click "Save All Changes"
- [ ] Navigate to public homepage and verify changes
- [ ] Navigate to public about page and verify changes

## 7. SEO Settings Testing

- [ ] Navigate to SEO Settings page
- [ ] Edit Homepage meta title
- [ ] Verify character counter updates
- [ ] Edit Homepage meta description
- [ ] Verify character counter shows length
- [ ] Edit About page meta tags
- [ ] Edit Venues page meta tags
- [ ] Edit Blogs page meta tags
- [ ] Edit Default fallback meta tags
- [ ] Click "Save All SEO Settings"
- [ ] Check browser dev tools to verify meta tags in HTML

## 8. Tags & Categories Testing

### Venue Tags
- [ ] Navigate to Tags & Categories page
- [ ] Add a new tag (e.g., "Test Tag")
- [ ] Verify tag appears in list
- [ ] Delete a tag
- [ ] Verify tag is removed

### Venue Categories
- [ ] Add a new category (e.g., "Test Category")
- [ ] Verify category appears in list
- [ ] Delete a category
- [ ] Verify category is removed
- [ ] Create a venue and check if new category appears

## 9. Featured Venues Testing

- [ ] Navigate to Featured Venues page
- [ ] Verify all venues display with images
- [ ] Click on a venue to select it
- [ ] Verify checkbox appears and card highlights
- [ ] Select 3-5 venues
- [ ] Verify counter updates (e.g., "5 selected")
- [ ] Click "Save Changes"
- [ ] Navigate to public homepage
- [ ] Verify selected venues appear in carousel/featured section

## 10. Analytics Testing

- [ ] Navigate to Analytics page
- [ ] Verify platform statistics display
  - [ ] Total users count
  - [ ] Total venues count
  - [ ] Total blogs count
  - [ ] Recent activity (last 7 days)
- [ ] Enter a Google Analytics Measurement ID (format: G-XXXXXXXXXX)
- [ ] Click "Save Analytics ID"
- [ ] Verify success message
- [ ] Click link to Google Analytics
- [ ] Verify it opens in new tab

## 11. Cross-Browser Testing

Test on multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## 12. Performance Testing

- [ ] Load admin dashboard - should be under 3 seconds
- [ ] Navigate between pages - should be instant
- [ ] Load user list with many users
- [ ] Load venue list with many venues
- [ ] Test search performance on large datasets

## 13. Error Handling

- [ ] Test with no internet connection
- [ ] Test deleting non-existent items
- [ ] Test saving with invalid data
- [ ] Test navigation to invalid admin routes

## 14. Security Testing

- [ ] Try accessing admin routes without login
- [ ] Try accessing with non-admin account
- [ ] Verify logout works correctly
- [ ] Verify session persistence across page refresh

## 15. Integration Testing

### Homepage Integration
- [ ] Change homepage content in admin
- [ ] Verify changes appear on public homepage
- [ ] Select featured venues
- [ ] Verify they appear in homepage carousel

### SEO Integration
- [ ] Update SEO meta tags
- [ ] View page source on public pages
- [ ] Verify meta tags are correctly inserted

### Content Integration
- [ ] Edit user from admin
- [ ] View user profile on public site
- [ ] Verify changes appear
- [ ] Edit venue from admin
- [ ] View venue on public site
- [ ] Verify changes appear

## Issues Found

Document any issues discovered during testing:

| Issue # | Page | Description | Severity | Status |
|---------|------|-------------|----------|--------|
| 1 | | | | |
| 2 | | | | |

## Notes

Additional observations or recommendations:

---

## Sign-Off

- Tester: _________________
- Date: _________________
- Version: 1.0
- Status: [ ] Passed [ ] Failed [ ] Needs Review
