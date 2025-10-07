'use strict';

/**
 * Helper functions for database seeding
 * These utilities help manage seeding operations safely
 */

/**
 * Check if seeding should run based on environment and existing data
 */
const shouldSeed = async (strapi) => {
  // Only seed in development by default
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }

  // Allow forcing seed with environment variable
  if (process.env.FORCE_SEED === 'true') {
    console.log('🔄 FORCE_SEED is enabled, seeding will proceed...');
    return true;
  }

  return true;
};

/**
 * Check if a content type has existing data
 */
const hasExistingData = async (strapi, contentType) => {
  try {
    const count = await strapi.db.query(contentType).count();
    return count > 0;
  } catch (error) {
    console.log(`⚠️ Could not check existing data for ${contentType}:`, error.message);
    return false;
  }
};

/**
 * Clear all data from a content type (use with caution)
 */
const clearContentType = async (strapi, contentType, contentTypeName) => {
  try {
    await strapi.db.query(contentType).deleteMany({
      where: {
        id: {
          $notNull: true,
        },
      },
    });
    console.log(`🗑️ Cleared existing ${contentTypeName} data`);
  } catch (error) {
    console.log(`⚠️ Could not clear ${contentTypeName}:`, error.message);
  }
};

/**
 * Create content with error handling and relation support
 */
const createContent = async (strapi, contentType, data, contentTypeName) => {
  try {
    if (Array.isArray(data)) {
      // Create each item individually to handle relations properly
      const results = [];
      for (const item of data) {
        const result = await strapi.db.query(contentType).create({ data: item });
        results.push(result);
      }
      console.log(`✅ Created ${data.length} ${contentTypeName} entries`);
      return results;
    } else {
      // For single types, check if content already exists and update
      if (contentType.includes('social') || contentType.includes('contact')) {
        // These single types don't have i18n
        const existing = await strapi.db.query(contentType).findOne();
        if (existing) {
          const result = await strapi.db.query(contentType).update({
            where: { id: existing.id },
            data
          });
          console.log(`✅ Updated ${contentTypeName} entry`);
          return result;
        }
      }

      // Use Entity Service for better component handling, especially for homepage
      if (contentType.includes('homepage')) {
        const result = await strapi.entityService.create(contentType, {
          data,
          populate: {
            heroBackground: true,
            visionPoints: {
              populate: {
                icon: true
              }
            }
          }
        });
        console.log(`✅ Created ${contentTypeName} entry`);
        return result;
      } else {
        const result = await strapi.db.query(contentType).create({ data });
        console.log(`✅ Created ${contentTypeName} entry`);
        return result;
      }
    }
  } catch (error) {
    console.error(`❌ Failed to create ${contentTypeName}:`, error.message);
    console.error('Error details:', error);
    return false;
  }
};

/**
 * Find content by field value
 */
const findContentBy = async (strapi, contentType, field, value) => {
  try {
    return await strapi.db.query(contentType).findOne({
      where: { [field]: value }
    });
  } catch (error) {
    console.log(`⚠️ Could not find ${contentType} where ${field} = ${value}:`, error.message);
    return null;
  }
};

/**
 * Get environment configuration for seeding
 */
const getSeedConfig = () => {
  return {
    environment: process.env.NODE_ENV || 'development',
    forceSeed: process.env.FORCE_SEED === 'true',
    clearExisting: process.env.CLEAR_EXISTING_DATA === 'true',
    verbose: process.env.SEED_VERBOSE === 'true'
  };
};

module.exports = {
  shouldSeed,
  hasExistingData,
  clearContentType,
  createContent,
  findContentBy,
  getSeedConfig
};