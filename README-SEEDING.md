# Database Seeding Documentation

## Overview

The More Montreal CMS automatically seeds the database with comprehensive sample data in development mode. This ensures that all content types have data and the Gatsby frontend can build successfully.

## What Gets Seeded

### Content Types with Full Data
✅ **Political Parties** - 8 parties (federal, provincial, municipal)
✅ **Policy Categories** - 5 categories (Housing, Transportation, Environment, etc.)
✅ **Post Categories** - 4 categories for blog organization
✅ **Policies** - 4 sample policies with different grades
✅ **Policy Supports** - Relationships between parties and policies
✅ **Actions** - 3 actionable community engagement items
✅ **Events** - 3 upcoming events with scheduling
✅ **Homepage** - Hero content and configuration
✅ **Policies Page** - Platform settings and content
✅ **Involvement Callout** - Community engagement content
✅ **Contact Page** - Form configuration
✅ **Social Links** - Platform links configuration

### Automatic Image Seeding
✅ **All content types now fully seeded** with placeholder images from [Lorem Picsum](https://picsum.photos):

- **Posts** - Includes `thumbnail` and `seoThumbnail` images
- **Actions** - Includes `thumbnail` images
- **Events** - Includes `thumbnail` images
- **Homepage** - Includes `heroBackground` image
- **Policies Page** - Includes `heroBackground` and `seoImage`
- **Involvement Callout** - Includes placeholder `image`

**Image Features:**
- Contextual images (city halls, meeting rooms, transit, housing)
- Proper alt text for accessibility
- Unique seeded images (consistent but varied)
- No manual uploads required

## Manual Steps After Seeding

The seeding is now completely automated! You only need to:

1. **Start the development server**: `npm run develop`
2. **Access admin panel**: `localhost:1337/admin`
3. **Create admin user** (first time only)
4. **Verify seeded content** - all content types should have sample data with images

**Note**: The seeding process includes image downloads, so the first run may take 30-60 seconds longer than usual.

## Environment Variables

Control seeding behavior with these environment variables:

```bash
# Force re-seeding even if data exists
FORCE_SEED=true npm run develop

# Enable verbose seeding logs
SEED_VERBOSE=true npm run develop

# Clear existing data before seeding (destructive!)
CLEAR_EXISTING_DATA=true npm run develop

# Combine for complete reset and re-seed (useful for debugging)
CLEAR_EXISTING_DATA=true FORCE_SEED=true SEED_VERBOSE=true npm run develop
```

## File Structure

```
src/
├── index.js         # Bootstrap function that triggers seeding
├── seedData.js      # Main seeding logic and content
├── seedHelpers.js   # Utility functions for safe seeding
└── imageSeeding.js  # Placeholder image downloading and upload
```


## Production Safety

- Seeding **only runs in development mode** (`NODE_ENV=development`)
- Production deployments are not affected
- Use `FORCE_SEED=true` to override safety checks if needed

## Troubleshooting

### "Database already seeded, skipping..."
This is normal behavior. Use `FORCE_SEED=true` to seed anyway.

### Gatsby build fails with missing content
Ensure all required content types have at least one published entry with required fields.

### Media upload issues
Remember that some content types require images. Upload placeholder images through the admin panel.

## Adding New Content Types

When adding new content types:

1. Add seeding function to `seedData.js`
2. Update this README with the new content type
3. Test seeding with `FORCE_SEED=true`