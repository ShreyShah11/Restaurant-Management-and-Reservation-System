import mongoose, { InferSchemaType } from 'mongoose';
const { Schema } = mongoose;

const bookingSchema = new Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },

        restaurantID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'restaurant',
            required: true,
        },

        bookingAt: {
            type: Date,
            required: true,
        },

        numberOfGuests: {
            type: Number,
            required: true,
            min: 1,
        },

        message: {
            type: String,
            trim: true,
            default: '',
        },

        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'payment pending', 'confirmed', 'executed'],
            default: 'pending',
        },

        category: {
            type: String,
            enum: ['breakfast', 'lunch', 'dinner'],
            default: 'other',
        },

        phoneNumber: {
            type: String,
            required: true,
        },

        // CUSTOMER PAYMENT LINK ID
        paymentLinkID: {
            type: String,
            default: null,
        },

        // CUSTOMER PAYMENT LINK
        paymentLinkURL: {
            type: String,
            default: null,
        },

        // USED by CRON JOB to check if the booking details have been transferred to restaurant system
        transferredToRestaurant: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    },
);

const Booking = mongoose.model('booking', bookingSchema);
export type IBooking = mongoose.Document & InferSchemaType<typeof bookingSchema>;

export default Booking;
