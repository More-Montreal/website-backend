import type { Schema, Attribute } from '@strapi/strapi';

export interface PresentationKeyPoint extends Schema.Component {
  collectionName: 'components_presentation_key_points';
  info: {
    displayName: 'Key Point';
    icon: 'arrow-circle-right';
    description: '';
  };
  attributes: {
    icon: Attribute.Media;
    title: Attribute.String & Attribute.Required;
    content: Attribute.RichText &
      Attribute.SetMinMaxLength<{
        maxLength: 500;
      }>;
    color: Attribute.Enumeration<['gray', 'blue', 'red', 'green', 'indigo']> &
      Attribute.Required &
      Attribute.DefaultTo<'gray'>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'presentation.key-point': PresentationKeyPoint;
    }
  }
}
