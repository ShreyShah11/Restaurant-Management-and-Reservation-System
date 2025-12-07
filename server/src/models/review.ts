import mongoose, { InferSchemaType } from 'mongoose';
const { Schema } = mongoose;

const reviewSchema = new Schema(
    {
        userID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true,
        },

        name: {
            type: String,
            required: true,
        },

        restaurantID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'restaurant',
            required: true,
        },

        content: {
            type: String,
            default: '',
            trim: true,
        },

        rate: {
            type: Number,
            enum: [1, 2, 3, 4, 5],
            required: true,
        },
    },
    {
        timestamps: true,
    },
);

const Review = mongoose.model('review', reviewSchema);
export type IReview = mongoose.Document & InferSchemaType<typeof reviewSchema>;

export default Review;
