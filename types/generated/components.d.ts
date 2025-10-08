import type { Schema, Attribute } from '@strapi/strapi';

export interface CityPolicyAnswerPolicyAnswer extends Schema.Component {
  collectionName: 'components_city_policy_answer_policy_answers';
  info: {
    displayName: 'Policy Answer';
    icon: 'quote';
    description: '';
  };
  attributes: {
    city: Attribute.Enumeration<
      [
        'Blainville',
        'Brossard',
        'Ch\u00E2teauguay',
        'Laval',
        'Longueuil',
        'Mascouche',
        'Mirabel',
        'Montr\u00E9al',
        'Repentigny',
        'Saint-J\u00E9r\u00F4me',
        'Terrebonne'
      ]
    > &
      Attribute.Required;
    politicalParty: Attribute.Enumeration<
      [
        'Action Citoyens Blainville',
        'Vrai Blainville',
        'Brossard Ensemble',
        'Vision Brossard',
        'Alliance Ch\u00E2teauguay',
        'Parti Laval',
        'Mouvement Lavallois',
        'Action Laval',
        'Coalition Longueuil',
        'Agora Longueuil',
        'Option Alliance',
        'Vision D\u00E9mocratique de Mascouche',
        'Mouvement Citoyen Mirabel',
        'Action Mirabel',
        'Projet Montr\u00E9al',
        'Ensemble Montr\u00E9al',
        'Transition Montr\u00E9al',
        'Futur Montr\u00E9al',
        'Action Montr\u00E9al',
        'Repentigny Ensemble',
        'Avenir Repentigny',
        'Mouvement J\u00E9r\u00F4mien',
        'Avenir Saint-J\u00E9r\u00F4me',
        'Mouvement Terrebonne'
      ]
    > &
      Attribute.Required;
    answer: Attribute.RichText;
  };
}

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
      'city-policy-answer.policy-answer': CityPolicyAnswerPolicyAnswer;
      'presentation.key-point': PresentationKeyPoint;
    }
  }
}
