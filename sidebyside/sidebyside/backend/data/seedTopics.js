const Topic = require('../models/Topic');

const defaultTopics = [
  {
    name: 'Technology & AI',
    description: 'Debates about artificial intelligence, software, platforms, and digital society.',
    icon: '⬡',
    color: '#1A5EFF',
  },
  {
    name: 'Politics & Policy',
    description: 'Government, law, elections, regulation, and public policy debates.',
    icon: '◎',
    color: '#FF6B1A',
  },
  {
    name: 'Science & Health',
    description: 'Medicine, research, climate, biotechnology, and public health questions.',
    icon: '◈',
    color: '#22D96B',
  },
  {
    name: 'Society & Culture',
    description: 'Education, ethics, identity, media, and social change discussions.',
    icon: '◑',
    color: '#FFB020',
  },
  {
    name: 'Economics',
    description: 'Markets, trade, jobs, taxation, growth, and economic policy debates.',
    icon: '◇',
    color: '#17BEBB',
  },
  {
    name: 'Philosophy & Ethics',
    description: 'Moral dilemmas, values, rights, and philosophical reasoning.',
    icon: '⚖',
    color: '#FF6B1A',
  },
  {
    name: 'Other',
    description: 'For debates that do not fit neatly into the main topic groups.',
    icon: '•',
    color: '#8B90A0',
  },
];

const seedTopics = async () => {
  for (const topic of defaultTopics) {
    await Topic.updateOne(
      { slug: topic.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') },
      { $setOnInsert: { ...topic, debateCount: 0, isActive: true } },
      { upsert: true }
    );
  }
};

module.exports = { seedTopics, defaultTopics };
