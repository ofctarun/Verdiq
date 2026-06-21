import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
    },
    activeTools: {
      type: [String],
      enum: ['web_search', 'github', 'calculator'],
      default: ['web_search'],
    },
    systemPrompt: {
      type: String,
      default: '',
      maxlength: 500,
      trim: true,
    },
    attachments: {
      type: [
        {
          filename: { type: String, required: true },
          textContent: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const chatModel = mongoose.model('Chat', chatSchema);

export default chatModel;