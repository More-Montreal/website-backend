'use strict';

/**
 * Seed data for More Montreal CMS
 * This script populates the database with initial data for development
 */

const { hasExistingData, createContent, getSeedConfig, clearContentType } = require('./seedHelpers');
const { seedPlaceholderImages } = require('./imageSeeding');

const seedData = async (strapi) => {
  try {
    const config = getSeedConfig();
    console.log('🌱 Starting database seeding...');

    if (config.verbose) {
      console.log('📋 Seed configuration:', config);
    }

    // Check if we've already seeded by looking for a specific content type
    const alreadySeeded = await hasExistingData(strapi, 'api::political-party.political-party');

    if (alreadySeeded && !config.forceSeed) {
      console.log('✅ Database already seeded, skipping...');
      console.log('💡 Use FORCE_SEED=true to seed anyway');
      return;
    }

    // Clear existing data if requested
    if (config.clearExisting) {
      console.log('🗑️ Clearing existing data...');
      await clearAllContentTypes(strapi);
    }

    // 1. Seed Political Parties (must be first as they're referenced by other content)
    await seedPoliticalParties(strapi);

    // 2. Seed Policy Categories
    await seedPolicyCategories(strapi);

    // 3. Seed Post Categories
    await seedPostCategories(strapi);

    // 4. Seed basic content that doesn't require media
    await seedPolicies(strapi);

    // 5. Seed policy supports (requires policies and political parties)
    await seedPolicySupports(strapi);

    // 6. Seed placeholder images (this may take a moment)
    const images = await seedPlaceholderImages(strapi);

    // 7. Seed single-type content (with images)
    await seedSingleTypeContent(strapi, images);

    // 8. Seed collection types with images
    await seedActions(strapi, images);
    await seedEvents(strapi, images);
    await seedPosts(strapi, images);

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  }
};

const seedPoliticalParties = async (strapi) => {
  console.log('📊 Seeding political parties...');

  const politicalParties = [
    {
      name: 'Coalition Avenir Québec',
      shortName: 'CAQ',
      description: 'Provincial political party in Quebec',
      color: 'blue',
      jurisdiction: 'provincial',
      locale: 'en'
    },
    {
      name: 'Parti Libéral du Québec',
      shortName: 'PLQ',
      description: 'Liberal party of Quebec',
      color: 'red',
      jurisdiction: 'provincial',
      locale: 'en'
    },
    {
      name: 'Québec solidaire',
      shortName: 'QS',
      description: 'Progressive political party in Quebec',
      color: 'orange',
      jurisdiction: 'provincial',
      locale: 'en'
    },
    {
      name: 'Parti Québécois',
      shortName: 'PQ',
      description: 'Sovereigntist political party in Quebec',
      color: 'cyan',
      jurisdiction: 'provincial',
      locale: 'en'
    },
    {
      name: 'Liberal Party of Canada',
      shortName: 'LPC',
      description: 'Federal liberal party of Canada',
      color: 'red',
      jurisdiction: 'federal',
      locale: 'en'
    },
    {
      name: 'Conservative Party of Canada',
      shortName: 'CPC',
      description: 'Federal conservative party of Canada',
      color: 'blue',
      jurisdiction: 'federal',
      locale: 'en'
    },
    {
      name: 'New Democratic Party',
      shortName: 'NDP',
      description: 'Federal social democratic party of Canada',
      color: 'orange',
      jurisdiction: 'federal',
      locale: 'en'
    },
    {
      name: 'Bloc Québécois',
      shortName: 'BQ',
      description: 'Federal sovereigntist party representing Quebec',
      color: 'cyan',
      jurisdiction: 'federal',
      locale: 'en'
    }
  ];

  await createContent(strapi, 'api::political-party.political-party', politicalParties, 'political parties');
};

const seedPolicyCategories = async (strapi) => {
  console.log('📁 Seeding policy categories...');

  const policyCategories = [
    {
      name: 'Housing & Development',
      description: 'Policies related to housing affordability, development, and urban planning',
      locale: 'en'
    },
    {
      name: 'Transportation',
      description: 'Public transit, cycling infrastructure, and urban mobility policies',
      locale: 'en'
    },
    {
      name: 'Environment',
      description: 'Climate action, sustainability, and environmental protection policies',
      locale: 'en'
    },
    {
      name: 'Social Services',
      description: 'Healthcare, education, and social support policies',
      locale: 'en'
    },
    {
      name: 'Economic Development',
      description: 'Job creation, business support, and economic growth policies',
      locale: 'en'
    }
  ];

  await createContent(strapi, 'api::policy-category.policy-category', policyCategories, 'policy categories');
};

const seedPostCategories = async (strapi) => {
  console.log('📝 Seeding post categories...');

  const postCategories = [
    {
      title: 'News & Updates',
      slug: 'news-updates',
      description: 'Latest news and updates from More Montreal',
      locale: 'en'
    },
    {
      title: 'Policy Analysis',
      slug: 'policy-analysis',
      description: 'In-depth analysis of housing and urban development policies',
      locale: 'en'
    },
    {
      title: 'Community Engagement',
      slug: 'community-engagement',
      description: 'Community events, meetings, and engagement opportunities',
      locale: 'en'
    },
    {
      title: 'Research & Data',
      slug: 'research-data',
      description: 'Research findings and data analysis related to Montreal housing',
      locale: 'en'
    }
  ];

  await createContent(strapi, 'api::post-category.post-category', postCategories, 'post categories');
};

const seedPolicies = async (strapi) => {
  console.log('📋 Seeding sample policies...');

  // Get policy categories to reference them
  const housingCategory = await strapi.db.query('api::policy-category.policy-category').findOne({
    where: { name: 'Housing & Development' }
  });

  const transportCategory = await strapi.db.query('api::policy-category.policy-category').findOne({
    where: { name: 'Transportation' }
  });

  if (!housingCategory || !transportCategory) {
    console.log('⚠️ Policy categories not found, skipping policy seeding');
    return;
  }

  const policies = [
    {
      title: 'Inclusionary Zoning Policy',
      explanation: 'Require new residential developments to include a percentage of affordable housing units or pay into an affordable housing fund.',
      justification: 'This policy helps ensure that new developments contribute to affordable housing supply and prevents the displacement of lower-income residents in gentrifying neighborhoods.',
      grade: 'gold',
      policy_category: housingCategory?.id,
      locale: 'en'
    },
    {
      title: 'Rent Stabilization Program',
      explanation: 'Implement rent control measures to limit annual rent increases and protect tenants from excessive rent hikes.',
      justification: 'Protects existing residents from displacement and ensures housing remains affordable for current tenants.',
      grade: 'silver',
      policy_category: housingCategory?.id,
      locale: 'en'
    },
    {
      title: 'Transit-Oriented Development',
      explanation: 'Encourage high-density, mixed-use development near public transit stations to reduce car dependency.',
      justification: 'Promotes sustainable urban growth, reduces transportation costs for residents, and maximizes the efficiency of public transit investments.',
      grade: 'gold',
      policy_category: transportCategory?.id,
      locale: 'en'
    },
    {
      title: 'Missing Middle Housing Initiative',
      explanation: 'Allow construction of duplexes, triplexes, and small apartment buildings in single-family zoning areas.',
      justification: 'Increases housing supply and provides more affordable housing options while maintaining neighborhood character.',
      grade: 'bronze',
      policy_category: housingCategory?.id,
      locale: 'en'
    }
  ];

  await createContent(strapi, 'api::policy.policy', policies, 'sample policies');
};

const seedPolicySupports = async (strapi) => {
  console.log('🤝 Seeding policy supports...');

  // Get some policies and political parties to create supports
  const policies = await strapi.db.query('api::policy.policy').findMany({ limit: 2 });
  const politicalParties = await strapi.db.query('api::political-party.political-party').findMany({ limit: 4 });

  if (policies.length === 0 || politicalParties.length === 0) {
    console.log('⚠️ No policies or political parties found, skipping policy supports seeding');
    return;
  }

  const policySupports = [
    {
      policy: policies[0].id,
      political_party: politicalParties.find(p => p.shortName === 'QS')?.id || politicalParties[0].id,
      quote: 'We strongly support inclusionary zoning as a key tool for maintaining affordable housing in our communities.',
      author: 'Housing Spokesperson',
      source: 'Official Party Platform',
      fullSupport: true,
      locale: 'en'
    },
    {
      policy: policies[0].id,
      political_party: politicalParties.find(p => p.shortName === 'PLQ')?.id || politicalParties[1].id,
      quote: 'While we support affordable housing goals, we have concerns about implementation details.',
      author: 'Municipal Affairs Critic',
      source: 'Press Release',
      fullSupport: false,
      locale: 'en'
    },
    {
      policy: policies[1]?.id || policies[0].id,
      political_party: politicalParties.find(p => p.shortName === 'NDP')?.id || politicalParties[2].id,
      quote: 'Transit-oriented development is essential for sustainable communities and reducing housing costs.',
      author: 'Transport Critic',
      source: 'Parliamentary Committee Statement',
      fullSupport: true,
      locale: 'en'
    }
  ];

  await createContent(strapi, 'api::policy-support.policy-support', policySupports, 'policy supports');
};

const seedSingleTypeContent = async (strapi, images = {}) => {
  console.log('🏠 Seeding single-type content...');

  // Get all policy categories for the policies page
  const allPolicyCategories = await strapi.db.query('api::policy-category.policy-category').findMany();
  const policyCategoryIds = allPolicyCategories.map(cat => cat.id);

  // Seed Homepage
  const homepage = {
    heroTitle: 'More Housing for Montreal',
    heroDescription: 'More Montreal advocates for evidence-based housing policies that create more homes for people at all income levels. Join us in building a city where everyone can afford to live.',
    electionsCallout: false,
    visionPoints: [
      {
        __component: 'presentation.key-point',
        title: 'Evidence-Based Policy',
        content: '## Research-Driven Solutions\n\nWe base our policy recommendations on rigorous research, data analysis, and proven successful models from other cities around the world.',
        color: 'blue'
      },
      {
        __component: 'presentation.key-point',
        title: 'Housing for All Income Levels',
        content: '## Inclusive Communities\n\nMontreal should be a city where teachers, nurses, artists, and service workers can afford to live, not just tech executives and finance professionals.',
        color: 'green'
      },
      {
        __component: 'presentation.key-point',
        title: 'Transit-Oriented Development',
        content: '## Sustainable Growth\n\nWe advocate for dense, walkable neighborhoods near public transit that reduce transportation costs and environmental impact.',
        color: 'indigo'
      },
      {
        __component: 'presentation.key-point',
        title: 'Community Engagement',
        content: '## Democratic Participation\n\nHousing policy affects everyone. We believe in inclusive decision-making that brings diverse voices to the table.',
        color: 'red'
      }
    ],
    locale: 'en'
  };

  if (images.homepageHero) {
    homepage.heroBackground = images.homepageHero;
  }

  // Add icons to visionPoints if available
  if (images.keyPointIcons && images.keyPointIcons.length >= 4) {
    homepage.visionPoints.forEach((point, index) => {
      if (images.keyPointIcons[index]) {
        point.icon = images.keyPointIcons[index];
      }
    });
  }

  await createContent(strapi, 'api::homepage.homepage', homepage, 'homepage');

  // Create French version of homepage
  const homepageFr = {
    heroTitle: 'Plus de logements pour Montréal',
    heroDescription: 'Plus Montréal préconise des politiques de logement fondées sur des preuves qui créent plus de logements pour les personnes de tous niveaux de revenus. Rejoignez-nous pour construire une ville où tout le monde peut se permettre de vivre.',
    electionsCallout: false,
    visionPoints: [
      {
        __component: 'presentation.key-point',
        title: 'Politique fondée sur des preuves',
        content: '## Solutions basées sur la recherche\n\nNous basons nos recommandations politiques sur une recherche rigoureuse, une analyse de données et des modèles réussis prouvés d\'autres villes du monde.',
        color: 'blue'
      },
      {
        __component: 'presentation.key-point',
        title: 'Logement pour tous les niveaux de revenus',
        content: '## Communautés inclusives\n\nMontréal devrait être une ville où les enseignants, les infirmières, les artistes et les travailleurs de service peuvent se permettre de vivre, pas seulement les cadres de la technologie et de la finance.',
        color: 'green'
      },
      {
        __component: 'presentation.key-point',
        title: 'Développement axé sur le transport',
        content: '## Croissance durable\n\nNous préconisons des quartiers denses et marchables près des transports publics qui réduisent les coûts de transport et l\'impact environnemental.',
        color: 'indigo'
      },
      {
        __component: 'presentation.key-point',
        title: 'Engagement communautaire',
        content: '## Participation démocratique\n\nLa politique du logement affecte tout le monde. Nous croyons en une prise de décision inclusive qui fait appel à diverses voix.',
        color: 'red'
      }
    ],
    locale: 'fr'
  };

  if (images.homepageHero) {
    homepageFr.heroBackground = images.homepageHero;
  }

  // Add icons to French visionPoints if available
  if (images.keyPointIcons && images.keyPointIcons.length >= 4) {
    homepageFr.visionPoints.forEach((point, index) => {
      if (images.keyPointIcons[index]) {
        point.icon = images.keyPointIcons[index];
      }
    });
  }

  await createContent(strapi, 'api::homepage.homepage', homepageFr, 'homepage French');

  // Seed Policies Page
  const policiesPage = {
    heroTitle: 'Policy Platform',
    heroDescription: 'Discover our comprehensive policy platform for creating more affordable housing in Montreal.',
    policy_categories: policyCategoryIds,
    scoreParties: true,
    feedbackEmail: 'policies@moremontreal.ca',
    locale: 'en'
  };

  if (images.policiesHero) {
    policiesPage.heroBackground = images.policiesHero;
  }
  if (images.policiesSeo) {
    policiesPage.seoImage = images.policiesSeo;
  }

  await createContent(strapi, 'api::policies-page.policies-page', policiesPage, 'policies page');

  // Create French version of policies page
  const policiesPageFr = {
    heroTitle: 'Plateforme politique',
    heroDescription: 'Découvrez notre plateforme politique complète pour créer plus de logements abordables à Montréal.',
    policy_categories: policyCategoryIds,
    scoreParties: true,
    feedbackEmail: 'policies@moremontreal.ca',
    locale: 'fr'
  };

  if (images.policiesHero) {
    policiesPageFr.heroBackground = images.policiesHero;
  }
  if (images.policiesSeo) {
    policiesPageFr.seoImage = images.policiesSeo;
  }

  await createContent(strapi, 'api::policies-page.policies-page', policiesPageFr, 'policies page French');

  // Seed Involvement Callout
  const involvementCallout = {
    title: 'Get Involved with More Montreal',
    content: 'Join our community of housing advocates working to make Montreal more affordable for everyone. Attend our events, contribute to policy discussions, and help build a better city.',
    joinLink: 'https://discord.com/invite/X2bsk7a2qA',
    locale: 'en'
  };

  if (images.involvementImage) {
    involvementCallout.image = images.involvementImage;
  }

  await createContent(strapi, 'api::involvement-callout.involvement-callout', involvementCallout, 'involvement callout');

  // Create French version of involvement callout
  const involvementCalloutFr = {
    title: 'Participez avec Plus Montréal',
    content: 'Rejoignez notre communauté de défenseurs du logement qui travaillent pour rendre Montréal plus abordable pour tous. Assistez à nos événements, contribuez aux discussions politiques et aidez à construire une meilleure ville.',
    joinLink: 'https://discord.com/invite/X2bsk7a2qA',
    locale: 'fr'
  };

  if (images.involvementImage) {
    involvementCalloutFr.image = images.involvementImage;
  }

  await createContent(strapi, 'api::involvement-callout.involvement-callout', involvementCalloutFr, 'involvement callout French');

  // Seed Contact
  const contact = {
    title: 'Contact More Montreal',
    description: 'Have questions or want to get involved? Reach out to us using the form below.',
    formId: 'contact-form-1',
    locale: 'en'
  };

  await createContent(strapi, 'api::contact.contact', contact, 'contact page');

  // Seed Social Links
  const social = {
    discordLink: 'https://discord.com/invite/X2bsk7a2qA',
    twitterLink: 'https://twitter.com/more_montreal',
    mastodonLink: 'https://mstdn.ca/@moremontreal',
    facebookLink: 'https://facebook.com/moremontreal',
    instagramLink: 'https://instagram.com/more_montreal',
    blueSkyLink: 'https://bsky.app/profile/moremontreal.bsky.social'
  };

  await createContent(strapi, 'api::social.social', social, 'social links');
};

const seedActions = async (strapi, images = {}) => {
  console.log('📢 Seeding actions...');

  const actions = [
    {
      title: 'Advocate for Inclusionary Zoning',
      slug: 'advocate-inclusionary-zoning',
      description: 'Contact your city councillor to support inclusionary zoning policies that require new developments to include affordable housing units.',
      locale: 'en',
      publishedAt: new Date()
    },
    {
      title: 'Support Transit-Oriented Development',
      slug: 'support-transit-oriented-development',
      description: 'Encourage high-density development near public transit to reduce transportation costs and create more affordable housing options.',
      locale: 'en',
      publishedAt: new Date()
    },
    {
      title: 'Attend City Council Meetings',
      slug: 'attend-city-council-meetings',
      description: 'Participate in local democracy by attending city council meetings and speaking up for housing policies that benefit all residents.',
      locale: 'en',
      publishedAt: new Date()
    }
  ];

  // Add thumbnail images if available
  if (images.actions && images.actions.length >= actions.length) {
    actions.forEach((action, index) => {
      if (images.actions[index]) {
        action.thumbnail = images.actions[index];
      }
    });
  }

  await createContent(strapi, 'api::action.action', actions, 'actions');

  // Create French versions of actions
  const actionsFr = [
    {
      title: 'Plaider pour le zonage inclusif',
      slug: 'plaider-zonage-inclusif',
      description: 'Contactez votre conseiller municipal pour soutenir les politiques de zonage inclusif qui exigent que les nouveaux développements incluent des unités de logement abordable.',
      locale: 'fr',
      publishedAt: new Date()
    },
    {
      title: 'Soutenir le développement axé sur le transport',
      slug: 'soutenir-developpement-transport',
      description: 'Encouragez le développement de haute densité près des transports publics pour réduire les coûts de transport et créer plus d\'options de logement abordable.',
      locale: 'fr',
      publishedAt: new Date()
    },
    {
      title: 'Assister aux réunions du conseil municipal',
      slug: 'assister-reunions-conseil-municipal',
      description: 'Participez à la démocratie locale en assistant aux réunions du conseil municipal et en vous exprimant pour des politiques de logement qui profitent à tous les résidents.',
      locale: 'fr',
      publishedAt: new Date()
    }
  ];

  // Add thumbnail images to French actions if available
  if (images.actions && images.actions.length >= actionsFr.length) {
    actionsFr.forEach((action, index) => {
      if (images.actions[index]) {
        action.thumbnail = images.actions[index];
      }
    });
  }

  await createContent(strapi, 'api::action.action', actionsFr, 'actions French');
};

const seedEvents = async (strapi, images = {}) => {
  console.log('📅 Seeding events...');

  const events = [
    {
      title: 'Monthly Housing Policy Meeting',
      slug: 'monthly-housing-policy-meeting',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      description: 'Join us for our monthly discussion on housing policy developments in Montreal. We review recent policy changes and plan advocacy strategies.',
      rsvpLink: 'https://discord.com/invite/X2bsk7a2qA',
      inPerson: false,
      locationLink: 'https://discord.com/invite/X2bsk7a2qA',
      locale: 'en',
      publishedAt: new Date()
    },
    {
      title: 'Community Housing Forum',
      slug: 'community-housing-forum',
      scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      description: 'A public forum to discuss housing challenges and solutions with community members, local officials, and housing experts.',
      rsvpLink: 'https://example.com/rsvp',
      inPerson: true,
      locationLink: 'https://maps.google.com/example',
      locale: 'en',
      publishedAt: new Date()
    },
    {
      title: 'Policy Research Workshop',
      slug: 'policy-research-workshop',
      scheduledDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
      description: 'Learn how to research and analyze housing policies. Perfect for new volunteers who want to contribute to our policy development efforts.',
      rsvpLink: 'https://discord.com/invite/X2bsk7a2qA',
      inPerson: false,
      locationLink: 'https://discord.com/invite/X2bsk7a2qA',
      locale: 'en',
      publishedAt: new Date()
    }
  ];

  // Add thumbnail images if available
  if (images.events && images.events.length >= events.length) {
    events.forEach((event, index) => {
      if (images.events[index]) {
        event.thumbnail = images.events[index];
      }
    });
  }

  await createContent(strapi, 'api::event.event', events, 'events');

  // Create French versions of events
  const eventsFr = [
    {
      title: 'Réunion mensuelle sur la politique du logement',
      slug: 'reunion-mensuelle-politique-logement',
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 semaine à partir de maintenant
      description: 'Rejoignez-nous pour notre discussion mensuelle sur les développements de politique du logement à Montréal. Nous passons en revue les changements de politique récents et planifions des stratégies de plaidoyer.',
      rsvpLink: 'https://discord.com/invite/X2bsk7a2qA',
      inPerson: false,
      locationLink: 'https://discord.com/invite/X2bsk7a2qA',
      locale: 'fr',
      publishedAt: new Date()
    },
    {
      title: 'Forum communautaire sur le logement',
      slug: 'forum-communautaire-logement',
      scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 semaines à partir de maintenant
      description: 'Un forum public pour discuter des défis et solutions de logement avec les membres de la communauté, les responsables locaux et les experts en logement.',
      rsvpLink: 'https://example.com/rsvp',
      inPerson: true,
      locationLink: 'https://maps.google.com/example',
      locale: 'fr',
      publishedAt: new Date()
    },
    {
      title: 'Atelier de recherche politique',
      slug: 'atelier-recherche-politique',
      scheduledDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 semaines à partir de maintenant
      description: 'Apprenez à rechercher et analyser les politiques de logement. Parfait pour les nouveaux bénévoles qui veulent contribuer à nos efforts de développement de politiques.',
      rsvpLink: 'https://example.com/workshop-rsvp',
      inPerson: true,
      locationLink: 'https://maps.google.com/workshop',
      locale: 'fr',
      publishedAt: new Date()
    }
  ];

  // Add thumbnail images to French events if available
  if (images.events && images.events.length >= eventsFr.length) {
    eventsFr.forEach((event, index) => {
      if (images.events[index]) {
        event.thumbnail = images.events[index];
      }
    });
  }

  await createContent(strapi, 'api::event.event', eventsFr, 'events French');
};

const seedPosts = async (strapi, images = {}) => {
  console.log('📝 Seeding blog posts...');

  // Get post categories to reference them
  const newsCategory = await strapi.db.query('api::post-category.post-category').findOne({
    where: { title: 'News & Updates' }
  });

  const policyCategory = await strapi.db.query('api::post-category.post-category').findOne({
    where: { title: 'Policy Analysis' }
  });

  const researchCategory = await strapi.db.query('api::post-category.post-category').findOne({
    where: { title: 'Research & Data' }
  });

  if (!newsCategory || !policyCategory || !researchCategory) {
    console.log('⚠️ Post categories not found, skipping posts seeding');
    return;
  }

  // Get the first admin user to assign as author
  const firstAdminUser = await strapi.db.query('admin::user').findOne();
  if (!firstAdminUser) {
    console.log('⚠️ No admin users found, skipping posts seeding');
    return;
  }
  console.log(`👤 Using admin user "${firstAdminUser.firstname} ${firstAdminUser.lastname}" as post author`);

  // Ensure French locale exists
  try {
    const existingLocales = await strapi.plugins.i18n.services.locales.find();
    const frenchLocale = existingLocales.find(locale => locale.code === 'fr');

    if (!frenchLocale) {
      console.log('🌐 Creating French locale...');
      await strapi.plugins.i18n.services.locales.create({
        code: 'fr',
        name: 'Français',
        isDefault: true
      });
      console.log('✅ Created French locale as default');

      // Update English locale to not be default
      const englishLocale = existingLocales.find(locale => locale.code === 'en');
      if (englishLocale) {
        await strapi.plugins.i18n.services.locales.update(englishLocale.id, {
          isDefault: false
        });
        console.log('✅ Updated English locale to not be default');
      }
    } else {
      console.log('✅ French locale already exists');

      // Make sure French is default if it exists
      if (!frenchLocale.isDefault) {
        await strapi.plugins.i18n.services.locales.update(frenchLocale.id, {
          isDefault: true
        });
        console.log('✅ Made French locale the default');

        // Update English locale to not be default
        const englishLocale = existingLocales.find(locale => locale.code === 'en');
        if (englishLocale && englishLocale.isDefault) {
          await strapi.plugins.i18n.services.locales.update(englishLocale.id, {
            isDefault: false
          });
          console.log('✅ Updated English locale to not be default');
        }
      }
    }
  } catch (error) {
    console.error('❌ Failed to ensure French locale exists:', error.message);
    console.log('⚠️ Proceeding without French localizations');
    return;
  }

  // Create English posts first
  const englishPosts = [
    {
      title: 'Montreal Housing Crisis: New Data Shows Urgent Need for Action',
      slug: 'montreal-housing-crisis-new-data',
      excerpt: 'Recent statistics reveal the growing housing affordability crisis in Montreal and why immediate policy action is needed.',
      content: `# Montreal's Growing Housing Crisis

The latest housing data from Montreal reveals a concerning trend: housing costs continue to rise faster than incomes, pricing out middle-class families and essential workers.

## Key Findings

- Average rent increased by 12% this year alone
- Vacancy rates dropped to historic lows of 1.8%
- First-time buyer affordability index reached critical levels

## What This Means

Without intervention, Montreal risks becoming like Vancouver or Toronto, where housing costs force out the very workers that keep the city running.

## Our Recommendations

More Montreal advocates for immediate action on:
- Inclusionary zoning requirements
- Social housing development
- Transit-oriented development policies`,
      postCategories: [newsCategory?.id].filter(Boolean),
      author: firstAdminUser.id,
      locale: 'en',
      publishedAt: new Date()
    },
    {
      title: 'Policy Analysis: How Inclusionary Zoning Can Work in Montreal',
      slug: 'policy-analysis-inclusionary-zoning-montreal',
      excerpt: 'A deep dive into how inclusionary zoning policies could be implemented effectively in Montreal to create more affordable housing.',
      content: `# Making Inclusionary Zoning Work for Montreal

Inclusionary zoning has proven successful in cities across North America. Here's how Montreal can implement it effectively.

## What is Inclusionary Zoning?

Inclusionary zoning requires new residential developments to include a percentage of affordable housing units or pay into an affordable housing fund.

## Best Practices from Other Cities

### Toronto's Model
- 10% affordable housing requirement for developments over 10 units
- Option to pay in-lieu fees for downtown core

### Vancouver's Approach
- Varying requirements by neighborhood (5-20%)
- Long-term affordability agreements (60+ years)

## Recommendations for Montreal

1. **Start with 8-12% requirement** for developments over 20 units
2. **Phase in gradually** by borough over 3 years
3. **Include in-lieu fee option** set at market rates
4. **Focus on family-sized units** (2+ bedrooms)

## Implementation Challenges

- Developer resistance and cost concerns
- Need for complementary zoning changes
- Administrative capacity requirements

Montreal can learn from other cities' experiences to implement inclusionary zoning that works for both developers and residents.`,
      postCategories: [policyCategory?.id].filter(Boolean),
      author: firstAdminUser.id,
      locale: 'en',
      publishedAt: new Date()
    },
    {
      title: 'Research Report: Transit Access and Housing Affordability in Montreal',
      slug: 'research-transit-access-housing-affordability',
      excerpt: 'Our analysis of the relationship between public transit access and housing costs across Montreal neighborhoods.',
      content: `# Transit Access and Housing Affordability: A Montreal Study

More Montreal's research team analyzed the correlation between transit access and housing costs across the city.

## Methodology

We examined:
- Housing costs within 800m of metro/REM stations
- Transit frequency and housing price relationships
- Affordability by distance from transit hubs

## Key Findings

### Transit Premium Effect
Properties within walking distance of metro stations command a 15-25% price premium, making transit-accessible areas less affordable for middle-income residents.

### The Affordability Paradox
While transit access reduces transportation costs, the housing premium often exceeds transportation savings for moderate-income households.

## Geographic Patterns

### Most Affordable Transit-Accessible Areas
1. Honoré-Beaugrand area (Green Line)
2. Angrignon neighborhood (Green Line)
3. Saint-Michel district (Blue Line)

### Highest Transit Premiums
1. Downtown core stations (30%+ premium)
2. Plateau-Mont Royal (Orange/Green intersection)
3. Westmount area (Green Line)

## Policy Implications

Our research suggests Montreal needs:
- **Inclusionary zoning near transit** to maintain affordability
- **Upzoning around stations** to increase supply
- **Social housing targets** in transit-rich areas

## Data Sources

- CMHC rental market reports
- STM ridership data
- Municipal assessment records
- Statistics Canada census data

This research demonstrates the need for coordinated transit and housing policy to ensure public transportation investments benefit all income levels.`,
      postCategories: [researchCategory?.id].filter(Boolean),
      author: firstAdminUser.id,
      locale: 'en',
      publishedAt: new Date()
    }
  ];

  // Add thumbnail and SEO images if available
  if (images.postThumbnails && images.postSeoImages) {
    englishPosts.forEach((post, index) => {
      if (images.postThumbnails[index]) {
        post.thumbnail = images.postThumbnails[index];
      }
      if (images.postSeoImages[index]) {
        post.seoThumbnail = images.postSeoImages[index];
      }
    });
  }

  // Create English posts first
  const createdEnglishPosts = await createContent(strapi, 'api::post.post', englishPosts, 'English blog posts');

  // French post translations
  const frenchPosts = [
    {
      title: 'Crise du logement à Montréal : de nouvelles données révèlent un besoin urgent d\'action',
      slug: 'crise-logement-montreal-nouvelles-donnees',
      excerpt: 'Des statistiques récentes révèlent la crise croissante de l\'abordabilité du logement à Montréal et pourquoi une action politique immédiate est nécessaire.',
      content: `# La crise croissante du logement à Montréal

Les dernières données sur le logement à Montréal révèlent une tendance préoccupante : les coûts du logement continuent d'augmenter plus rapidement que les revenus, excluant les familles de classe moyenne et les travailleurs essentiels.

## Principales conclusions

- Le loyer moyen a augmenté de 12 % cette année seulement
- Les taux d'inoccupation ont chuté à des niveaux historiquement bas de 1,8 %
- L'indice d'abordabilité pour les premiers acheteurs a atteint des niveaux critiques

## Ce que cela signifie

Sans intervention, Montréal risque de devenir comme Vancouver ou Toronto, où les coûts du logement chassent les travailleurs mêmes qui font fonctionner la ville.

## Nos recommandations

Plus Montréal préconise une action immédiate sur :
- Exigences de zonage inclusif
- Développement de logements sociaux
- Politiques de développement axé sur le transport en commun`,
      postCategories: [newsCategory?.id].filter(Boolean),
      author: firstAdminUser.id,
      locale: 'fr',
      publishedAt: new Date()
    },
    {
      title: 'Analyse de politique : Comment le zonage inclusif peut fonctionner à Montréal',
      slug: 'analyse-politique-zonage-inclusif-montreal',
      excerpt: 'Une analyse approfondie de la façon dont les politiques de zonage inclusif pourraient être mises en œuvre efficacement à Montréal pour créer plus de logements abordables.',
      content: `# Faire fonctionner le zonage inclusif pour Montréal

Le zonage inclusif a prouvé son succès dans les villes d'Amérique du Nord. Voici comment Montréal peut l'implémenter efficacement.

## Qu'est-ce que le zonage inclusif ?

Le zonage inclusif exige que les nouveaux développements résidentiels incluent un pourcentage d'unités de logement abordable ou versent dans un fonds de logement abordable.

## Meilleures pratiques d'autres villes

### Le modèle de Toronto
- Exigence de 10 % de logements abordables pour les développements de plus de 10 unités
- Option de payer des frais de substitution pour le centre-ville

### L'approche de Vancouver
- Exigences variables par quartier (5-20 %)
- Accords d'abordabilité à long terme (60+ ans)

Montréal peut apprendre des expériences d'autres villes pour implémenter un zonage inclusif qui fonctionne à la fois pour les développeurs et les résidents.`,
      postCategories: [policyCategory?.id].filter(Boolean),
      author: firstAdminUser.id,
      locale: 'fr',
      publishedAt: new Date()
    },
    {
      title: 'Rapport de recherche : Accès au transport et abordabilité du logement à Montréal',
      slug: 'recherche-acces-transport-abordabilite-logement',
      excerpt: 'Une étude complète examine la relation entre l\'accessibilité au transport en commun et les prix du logement dans tous les arrondissements de Montréal.',
      content: `# Impact du transport en commun sur l'abordabilité du logement

Notre dernière recherche examine comment la proximité du transport en commun affecte les prix du logement dans la région métropolitaine de Montréal.

## Méthodologie de recherche

Cette étude a analysé :
- Les prix de location dans un rayon de 800 mètres des stations de métro et des arrêts de bus rapide
- Les changements de prix au cours des 5 dernières années
- La corrélation avec les investissements en transport en commun

## Principales conclusions

### Proximité du métro
- Les loyers près des stations de métro sont en moyenne 15 % plus élevés
- L'écart de prix s'est creusé de 3 % depuis 2019
- L'effet est plus prononcé dans les quartiers en gentrification

### Transport de surface
- L'accès aux lignes de bus rapide ajoute une prime de 8 % aux loyers
- Impact moins prononcé mais toujours significatif

## Sources de données

- Dossiers d'évaluation municipale
- Données de recensement de Statistique Canada

Cette recherche démontre la nécessité d'une politique coordonnée de transport et de logement pour s'assurer que les investissements en transport public profitent à tous les niveaux de revenus.`,
      postCategories: [researchCategory?.id].filter(Boolean),
      author: firstAdminUser.id,
      locale: 'fr',
      publishedAt: new Date()
    }
  ];

  // Create French posts as localizations of the English posts
  if (createdEnglishPosts && Array.isArray(createdEnglishPosts) && createdEnglishPosts.length === 3) {
    for (let i = 0; i < frenchPosts.length; i++) {
      try {
        const englishPost = createdEnglishPosts[i];
        const frenchPost = frenchPosts[i];

        // Create French localization linked to the English post
        await strapi.entityService.create('api::post.post', {
          data: {
            ...frenchPost,
            localizations: [englishPost.id]
          }
        });

        console.log(`✅ Created French localization for post: ${frenchPost.title}`);
      } catch (error) {
        console.error(`❌ Failed to create French localization for post ${i}:`, error.message);
      }
    }
  }
};

const clearAllContentTypes = async (strapi) => {
  const contentTypes = [
    'api::post.post',
    'api::event.event',
    'api::action.action',
    'api::policy-support.policy-support',
    'api::policy.policy',
    'api::post-category.post-category',
    'api::policy-category.policy-category',
    'api::political-party.political-party'
  ];

  const singleTypes = [
    'api::homepage.homepage',
    'api::policies-page.policies-page',
    'api::involvement-callout.involvement-callout',
    'api::contact.contact',
    'api::social.social'
  ];

  // Clear collection types
  for (const contentType of contentTypes) {
    try {
      await clearContentType(strapi, contentType, contentType.split('.')[1]);
    } catch (error) {
      console.log(`⚠️ Could not clear ${contentType}: ${error.message}`);
    }
  }

  // Clear single types
  for (const contentType of singleTypes) {
    try {
      await strapi.db.query(contentType).delete({
        where: {
          id: {
            $notNull: true,
          },
        },
      });
      console.log(`🗑️ Cleared ${contentType.split('.')[1]}`);
    } catch (error) {
      console.log(`⚠️ Could not clear ${contentType}: ${error.message}`);
    }
  }

  // Clear uploaded files
  try {
    await strapi.db.query('plugin::upload.file').deleteMany({
      where: {
        id: {
          $notNull: true,
        },
      },
    });
    console.log('🗑️ Cleared uploaded files');
  } catch (error) {
    console.log(`⚠️ Could not clear files: ${error.message}`);
  }
};

module.exports = seedData;