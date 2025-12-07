import mongoose, { InferSchemaType } from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            minLength: 2,
        },
        lastName: {
            type: String,
            minLength: 2,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            immutable: true,
            trim: true,
        },
        hashedPassword: {
            required: true,
            type: String,
        },
        role: {
            type: String,
            required: true,
            enum: ['owner', 'customer'],
        },

        cityName: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                required: true,
                default: [0, 0],
            },
        },
    },
    {
        timestamps: true,
    },
);

userSchema.index({ location: '2dsphere' });

const User = mongoose.model('user', userSchema);
export type IUser = mongoose.Document & InferSchemaType<typeof userSchema>;

export default User;
