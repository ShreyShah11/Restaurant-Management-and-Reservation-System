import mongoose, { InferSchemaType } from 'mongoose';
const { Schema } = mongoose;

const addressSchema = new Schema(
    {
        line1: {
            type: String,
            required: true,
            minLength: 3,
            trim: true,
        },
        line2: {
            type: String,
            required: true,
            minLength: 3,
            trim: true,
        },
        line3: {
            type: String,
            required: false,
            trim: true,
            default: '',
        },
        zip: {
            type: String,
            required: true,
            trim: true,
        },
        city: {
            type: String,
            required: true,
            minLength: 2,
        },
        state: {
            type: String,
            required: true,
            minLength: 2,
        },
        country: {
            type: String,
            required: true,
            minLength: 2,
        },
    },
    { _id: false },
);

const socialMediaSchema = new Schema(
    {
        facebook: {
            type: String,
            trim: true,
            default: '',
        },
        instagram: {
            type: String,
            trim: true,
            default: '',
        },
        twitter: {
            type: String,
            trim: true,
            default: '',
        },
    },
    { _id: false },
);

const timeSlotSchema = new Schema(
    {
        start: {
            type: Date,
            required: true,
        },
        end: {
            type: Date,
            required: true,
        },
    },
    { _id: false },
);

const openingHoursSchema = new Schema(
    {
        weekend: {
            type: timeSlotSchema,
            required: true,
        },
        weekday: {
            type: timeSlotSchema,
            required: true,
        },
    },
    { _id: false },
);

const statusSchema = new Schema(
    {
        isActive: {
            type: Boolean,
            default: true,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        temporarilyClosed: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false },
);

const accountSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },

        number: {
            type: String,
            required: true,
        },

        IFSC: {
            type: String,
            required: true,
        },
    },
    {
        _id: false,
    },
);

const restaurantSchema = new Schema(
    {
        restaurantName: {
            type: String,
            required: true,
            minLength: 2,
        },
        address: {
            type: addressSchema,
            required: true,
            default: () => ({}),
        },
        ownerName: {
            type: String,
            required: true,
            minLength: 2,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        restaurantEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },
        websiteURL: {
            type: String,
            trim: true,
        },
        socialMedia: {
            type: socialMediaSchema,
            required: true,
            default: () => ({}),
        },
        openingHours: {
            type: openingHoursSchema,
            required: true,
        },
        ratingsSum: {
            type: Number,
            default: 0,
        },
        ratingsCount: {
            type: Number,
            default: 0,
        },
        logoURL: {
            type: String,
            trim: true,
        },
        bannerURL: {
            type: String,
            trim: true,
            required: true,
        },
        about: {
            type: String,
            trim: true,
        },
        since: {
            type: Number,
        },
        slogan: {
            type: String,
            trim: true,
        },
        status: {
            type: statusSchema,
            required: true,
            default: () => ({}),
        },
        bankAccount: {
            type: accountSchema,
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const Restaurant = mongoose.model('restaurant', restaurantSchema);

export type IAddress = InferSchemaType<typeof addressSchema>;
export type ISocialMedia = InferSchemaType<typeof socialMediaSchema>;
export type ITimeSlot = InferSchemaType<typeof timeSlotSchema>;
export type IOpeningHours = InferSchemaType<typeof openingHoursSchema>;
export type IStatus = InferSchemaType<typeof statusSchema>;
export type IAccount = InferSchemaType<typeof accountSchema>;
export type IRestaurant = mongoose.Document & InferSchemaType<typeof restaurantSchema>;

export default Restaurant;
