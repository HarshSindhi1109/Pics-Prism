const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    name: {
      type: String,
      required: [true, 'Must add name...'],
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Must select a product...'],
    },

    review: {
      type: String,
      required: [true, 'Must write something....'],
    },

    imageUrl: {
      type: String,
      default: '',
    },

    rating: {
      type: Number,
      required: [true, 'Must be between 0 and 5....'],
      min: 0.5,
      max: 5,
      validate: {
        validator: function (v) {
          return Number.isInteger(v * 2);
        },
        message: 'Rating must be in steps of 0.5',
      },
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports =
  mongoose.models.Review || mongoose.model('Review', ReviewSchema);
