'use strict';

/**
 * Image seeding utilities for uploading placeholder images to Strapi
 * Uses Lorem Picsum for placeholder images
 */

const https = require('https');

/**
 * Download image from URL using Node.js https module with redirect handling
 */
const downloadImage = (url, maxRedirects = 5) => {
  return new Promise((resolve, reject) => {
    if (maxRedirects < 0) {
      reject(new Error('Too many redirects'));
      return;
    }

    const chunks = [];

    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        const location = response.headers.location;
        if (location) {
          console.log(`Following redirect from ${url} to ${location}`);
          return downloadImage(location, maxRedirects - 1).then(resolve).catch(reject);
        } else {
          reject(new Error(`Redirect without location header: ${response.statusCode}`));
          return;
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
};

/**
 * Sanitize filename for Strapi upload
 */
const sanitizeFilename = (filename) => {
  // Remove invalid characters and replace with underscores
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
};

/**
 * Create a placeholder image entry by downloading and uploading to Strapi
 */
const createPlaceholderImage = async (strapi, width, height, seed, fileName, altText = '') => {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');

  try {
    // Sanitize filename
    const sanitizedFileName = sanitizeFilename(fileName);

    // Create the Lorem Picsum URL
    const imageUrl = generatePlaceholderUrl(width, height, seed);

    // Download the image
    console.log(`📥 Downloading image from: ${imageUrl}`);
    const imageBuffer = await downloadImage(imageUrl);

    // Write to temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, sanitizedFileName);
    fs.writeFileSync(tempFilePath, imageBuffer);

    // Create file stats for upload
    const stats = fs.statSync(tempFilePath);

    // Create file object for upload
    const fileToUpload = {
      name: sanitizedFileName,
      type: 'image/jpeg',
      size: stats.size,
      path: tempFilePath
    };

    // Upload using Strapi's upload service
    const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
      data: {
        fileInfo: {
          alternativeText: altText,
          caption: altText,
          name: sanitizedFileName
        }
      },
      files: fileToUpload
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    console.log(`✅ Uploaded placeholder image: ${sanitizedFileName}`);
    return uploadedFiles[0]; // Return first uploaded file

  } catch (error) {
    console.error(`❌ Failed to create placeholder image ${fileName}:`, error.message);
    console.error('Error details:', error);
    return null;
  }
};

/**
 * Generate Lorem Picsum URL with specific parameters
 */
const generatePlaceholderUrl = (width, height, seed = null, grayscale = false, blur = 0) => {
  let url = `https://picsum.photos`;

  if (seed) {
    url += `/seed/${seed}`;
  }

  url += `/${width}/${height}.jpg`;

  const params = [];
  if (grayscale) params.push('grayscale');
  if (blur > 0) params.push(`blur=${blur}`);

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  return url;
};

/**
 * Upload image from URL to Strapi using direct URL reference
 */
const uploadImageFromUrl = async (strapi, imageUrl, fileName, altText = '') => {
  try {
    // Extract dimensions from Lorem Picsum URL
    const urlMatch = imageUrl.match(/\/(\d+)\/(\d+)/);
    const width = urlMatch ? parseInt(urlMatch[1]) : 800;
    const height = urlMatch ? parseInt(urlMatch[2]) : 600;

    // Create placeholder image entry
    return await createPlaceholderImage(strapi, width, height, fileName.split('-')[0], fileName, altText);
  } catch (error) {
    console.error(`❌ Failed to upload image ${fileName}:`, error.message);
    return null;
  }
};

/**
 * Create placeholder images for the CMS
 */
const seedPlaceholderImages = async (strapi) => {
  console.log('🖼️ Seeding placeholder images...');

  const images = {};

  // Homepage hero background
  try {
    const heroImage = await uploadImageFromUrl(
      strapi,
      generatePlaceholderUrl(1200, 600, 'montreal-skyline'),
      'homepage-hero.jpg',
      'Montreal skyline view representing housing and urban development'
    );
    if (heroImage) images.homepageHero = heroImage.id;
  } catch (error) {
    console.log('⚠️ Could not upload homepage hero image');
  }

  // Policies page hero background
  try {
    const policiesHero = await uploadImageFromUrl(
      strapi,
      generatePlaceholderUrl(1200, 400, 'policy-building'),
      'policies-hero.jpg',
      'Government building representing policy and governance'
    );
    if (policiesHero) images.policiesHero = policiesHero.id;
  } catch (error) {
    console.log('⚠️ Could not upload policies hero image');
  }

  // Policies page SEO image
  try {
    const policiesSeo = await uploadImageFromUrl(
      strapi,
      generatePlaceholderUrl(1200, 630, 'policy-seo'),
      'policies-seo.jpg',
      'Policy platform social media preview'
    );
    if (policiesSeo) images.policiesSeo = policiesSeo.id;
  } catch (error) {
    console.log('⚠️ Could not upload policies SEO image');
  }

  // Involvement callout image
  try {
    const involvementImage = await uploadImageFromUrl(
      strapi,
      generatePlaceholderUrl(800, 600, 'community-meeting'),
      'involvement-callout.jpg',
      'Community meeting representing civic engagement'
    );
    if (involvementImage) images.involvementImage = involvementImage.id;
  } catch (error) {
    console.log('⚠️ Could not upload involvement image');
  }

  // Action thumbnails
  const actionImages = [];
  const actionSeeds = ['city-hall', 'transit-station', 'housing-development'];
  const actionAlts = [
    'City hall building for local government advocacy',
    'Public transit station for transportation development',
    'Housing development for community meetings'
  ];

  for (let i = 0; i < 3; i++) {
    try {
      const actionImage = await uploadImageFromUrl(
        strapi,
        generatePlaceholderUrl(600, 400, actionSeeds[i]),
        `action-${i + 1}.jpg`,
        actionAlts[i]
      );
      if (actionImage) actionImages.push(actionImage.id);
    } catch (error) {
      console.log(`⚠️ Could not upload action image ${i + 1}`);
      actionImages.push(null);
    }
  }
  images.actions = actionImages;

  // Event thumbnails
  const eventImages = [];
  const eventSeeds = ['meeting-room', 'community-center', 'workshop-space'];
  const eventAlts = [
    'Meeting room for monthly policy discussions',
    'Community center for public housing forum',
    'Workshop space for policy research training'
  ];

  for (let i = 0; i < 3; i++) {
    try {
      const eventImage = await uploadImageFromUrl(
        strapi,
        generatePlaceholderUrl(600, 400, eventSeeds[i]),
        `event-${i + 1}.jpg`,
        eventAlts[i]
      );
      if (eventImage) eventImages.push(eventImage.id);
    } catch (error) {
      console.log(`⚠️ Could not upload event image ${i + 1}`);
      eventImages.push(null);
    }
  }
  images.events = eventImages;

  // Post thumbnails and SEO images
  const postThumbnails = [];
  const postSeoImages = [];
  const postSeeds = ['housing-policy', 'montreal-development', 'community-advocacy'];
  const postAlts = [
    'Housing policy analysis and research',
    'Montreal urban development and planning',
    'Community advocacy and engagement'
  ];

  for (let i = 0; i < 3; i++) {
    try {
      const thumbnail = await uploadImageFromUrl(
        strapi,
        generatePlaceholderUrl(600, 400, postSeeds[i]),
        `post-thumbnail-${i + 1}.jpg`,
        postAlts[i]
      );
      if (thumbnail) postThumbnails.push(thumbnail.id);

      const seoImage = await uploadImageFromUrl(
        strapi,
        generatePlaceholderUrl(1200, 630, `${postSeeds[i]}-seo`),
        `post-seo-${i + 1}.jpg`,
        postAlts[i]
      );
      if (seoImage) postSeoImages.push(seoImage.id);
    } catch (error) {
      console.log(`⚠️ Could not upload post images ${i + 1}`);
      postThumbnails.push(null);
      postSeoImages.push(null);
    }
  }
  images.postThumbnails = postThumbnails;
  images.postSeoImages = postSeoImages;

  // Key point icons (simple square icons for now)
  const keyPointIcons = [];
  const iconSeeds = ['chart', 'house', 'train', 'people'];
  const iconAlts = [
    'Chart icon for evidence-based policy',
    'House icon for housing for all',
    'Train icon for transit-oriented development',
    'People icon for community engagement'
  ];

  for (let i = 0; i < 4; i++) {
    try {
      const iconImage = await uploadImageFromUrl(
        strapi,
        generatePlaceholderUrl(100, 100, iconSeeds[i]),
        `keypoint-icon-${i + 1}.jpg`,
        iconAlts[i]
      );
      if (iconImage) keyPointIcons.push(iconImage.id);
    } catch (error) {
      console.log(`⚠️ Could not upload key point icon ${i + 1}`);
      keyPointIcons.push(null);
    }
  }
  images.keyPointIcons = keyPointIcons;

  console.log(`✅ Successfully uploaded ${Object.values(images).flat().filter(id => id !== null).length} placeholder images`);
  return images;
};

module.exports = {
  uploadImageFromUrl,
  generatePlaceholderUrl,
  seedPlaceholderImages
};