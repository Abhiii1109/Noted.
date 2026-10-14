import mongoose from 'mongoose';

const quoteSchema = new mongoose.Schema({
  quote: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    default: 'Anonymous Thinker',
    trim: true
  },
  category: {
    type: String,
    default: 'wisdom',
    lowercase: true,
    trim: true,
    index: true
  },
  colorId: {
    type: String,
    default: 'lime'
  },
  rotation: {
    type: Number,
    default: 0
  },
  tag: {
    type: String,
    default: 'WISDOM'
  },
  pinned: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  isCustom: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// High-performance query indexes
quoteSchema.index({ createdAt: -1 });
quoteSchema.index({ category: 1, createdAt: -1 });

// Text index for search
quoteSchema.index({ quote: 'text', author: 'text', category: 'text', tag: 'text' });

export const Quote = mongoose.model('Quote', quoteSchema);
