import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// Schema para los mensajes individuales
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    trim: true,
    required: true
  },
  content: {
    type: String,
    trim: true,
    required: true
  },
  timestamp: {
    type: Date,
    required: true
  }
});

// Schema principal para la conversación
const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true
    },
    participants: [{
      type: String,
      trim: true
    }],
    messages: [messageSchema], // Array de mensajes usando el schema de mensajes
    metadata: {
      type: Object,
      default: {}
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Plugin que convierte mongoose a json
conversationSchema.plugin(toJSON);

export default mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
