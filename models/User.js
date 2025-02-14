import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// USER SCHEMA
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
      unique: true,
      required: true,
    },
    image: {
      type: String,
    },
    role: {
      type: [String],
      required: true,
      enum: ["user", "admin"],
      default: ["user"],
    },
    // Used in the Stripe webhook to identify the user in Stripe and later create Customer Portal or prefill user credit card details
    customerId: {
      type: String,
      validate(value) {
        return value.includes("cus_");
      },
    },
    // Used in the Stripe webhook. should match a plan in config.js file.
    priceId: {
      type: String,
      validate(value) {
        return value.includes("price_");
      },
    },
    metadata: {
      type: Object,
    },
    // Used to determine if the user has access to the product—it's turn on/off by the Stripe webhook
    hasAccess: {
      type: Boolean,
      default: false,
    },
    // Campos de autenticación
    emailVerified: Date,
    password: String,
    
    // Campos de Stripe
    stripeCustomerId: String,
    subscriptionId: String,
    subscriptionStatus: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'unpaid', null],
      default: null
    },
    subscriptionPriceId: String,
    subscriptionCurrentPeriodEnd: Date,

    // Campos de la aplicación
    conversations: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation"
    }],
    lastLogin: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
