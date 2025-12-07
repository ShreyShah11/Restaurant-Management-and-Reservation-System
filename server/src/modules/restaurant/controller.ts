import Item from '@/models/item';
import Restaurant, { IRestaurant } from '@/models/restaurant';
import User from '@/models/user';
import logger from '@/utils/logger';
import { Request, Response } from 'express';
import { z } from 'zod';

const controller = {
    addRestaurant: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                restaurantName: z.string().min(2),

                address: z.object({
                    line1: z.string().min(3).trim(),
                    line2: z.string().min(3).trim(),
                    line3: z.string().optional(),
                    zip: z.string().trim(),
                    city: z.string().min(2),
                    state: z.string().min(2),
                    country: z.string().min(2),
                }),

                ownerName: z.string().min(2).trim(),

                phoneNumber: z.string().trim(),
                restaurantEmail: z.email().trim(),

                websiteURL: z.url().optional(),

                socialMedia: z.object({
                    facebook: z.url().optional(),
                    twitter: z.url().optional(),
                    instagram: z.url().optional(),
                }),

                openingHours: z.object({
                    weekend: z.object({
                        start: z.string(),
                        end: z.string(),
                    }),
                    weekday: z.object({
                        start: z.string(),
                        end: z.string(),
                    }),
                }),

                logoURL: z.url().trim().optional(),
                bannerURL: z.url().trim(),
                about: z.string().min(10).trim().optional(),
                since: z.number().optional(),
                slogan: z.string().min(5).trim().optional(),

                bankAccount: z.object({
                    name: z.string().min(2),
                    number: z.string().min(5),
                    IFSC: z.string().min(5),
                }),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                logger.warn('Validation failed in addRestaurant controller:', result.error);

                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: z.treeifyError(result.error),
                });
            }

            const userID = res.locals.userID! as string;

            const existingUser = await User.findById(userID);
            if (!existingUser) {
                logger.warn(`User not found with ID: ${userID} in addRestaurant controller`);
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }

            const existingRestaurant = await Restaurant.findOne({
                owner: userID,
            });
            if (existingRestaurant) {
                logger.warn(
                    `Restaurant already exists for user ID: ${userID} in addRestaurant controller`,
                );
                return res.status(400).json({
                    success: false,
                    message: 'Restaurant already exists for this user',
                });
            }

            const newRestaurant = new Restaurant({
                owner: userID,
                ...result.data,
            });

            newRestaurant.address.line3 = newRestaurant.address.line3 || undefined;
            await newRestaurant.save();

            return res.status(201).json({
                success: true,
                message: 'restaurant added successfully',
                restaurantID: newRestaurant._id,
            });
        } catch (error) {
            console.error('Error in add restaurant controller:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    },

    updateRestaurant: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                restaurantName: z.string().min(2).optional(),

                address: z
                    .object({
                        line1: z.string().min(3).trim().optional(),
                        line2: z.string().min(3).trim().optional(),
                        line3: z.string().trim().optional(),
                        zip: z.string().trim().optional(),
                        city: z.string().min(2).optional(),
                        state: z.string().min(2).optional(),
                        country: z.string().min(2).optional(),
                    })
                    .optional(),

                ownerName: z.string().min(2).trim().optional(),
                phoneNumber: z.string().trim().optional(),
                restaurantEmail: z.string().email().trim().optional(),

                websiteURL: z.string().url().optional(),

                socialMedia: z
                    .object({
                        facebook: z.string().url().optional(),
                        twitter: z.string().url().optional(),
                        instagram: z.string().url().optional(),
                    })
                    .optional(),

                openingHours: z
                    .object({
                        weekend: z
                            .object({
                                start: z.string().optional(),
                                end: z.string().optional(),
                            })
                            .optional(),
                        weekday: z
                            .object({
                                start: z.string().optional(),
                                end: z.string().optional(),
                            })
                            .optional(),
                    })
                    .optional(),

                logoURL: z.string().trim().optional(),
                bannerURL: z.string().trim().optional(),
                about: z.string().min(10).trim().optional(),
                since: z.number().optional(),
                slogan: z.string().min(5).trim().optional(),

                bankAccount: z
                    .object({
                        name: z.string().min(2).optional(),
                        number: z.string().min(2).optional(),
                        IFSC: z.string().min(5).optional(),
                    })
                    .optional(),
            });

            const result = schema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid data',
                    errors: z.treeifyError(result.error),
                });
            }

            const data = result.data;
            console.log('Update restaurant data:', JSON.stringify(data, null, 2));
            const owner = res.locals.userID as string;

            const existingRestaurant = (await Restaurant.findOne({ owner })) as IRestaurant | null;

            if (!existingRestaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found',
                });
            }

            if (data.restaurantName) existingRestaurant.restaurantName = data.restaurantName;
            if (data.ownerName) existingRestaurant.ownerName = data.ownerName;
            if (data.phoneNumber) existingRestaurant.phoneNumber = data.phoneNumber;
            if (data.restaurantEmail) existingRestaurant.restaurantEmail = data.restaurantEmail;
            if (data.websiteURL) existingRestaurant.websiteURL = data.websiteURL;
            if (data.logoURL) existingRestaurant.logoURL = data.logoURL;
            if (data.bannerURL) existingRestaurant.bannerURL = data.bannerURL;
            if (data.about) existingRestaurant.about = data.about;
            if (data.since) existingRestaurant.since = data.since;
            if (data.slogan) existingRestaurant.slogan = data.slogan;

            if (data.address) {
                if (data.address.line1) existingRestaurant.address.line1 = data.address.line1;
                if (data.address.line2) existingRestaurant.address.line2 = data.address.line2;
                if (data.address.line3 !== undefined) {
                    console.log('aaaa');
                    if (data.address.line3.length > 0) {
                        console.log('bbbb');
                        console.log('line3:', data.address.line3);
                        existingRestaurant.address.line3 = data.address.line3;
                    } else {
                        logger.debug('cccc');
                        existingRestaurant.address.line3 = undefined;
                    }
                }
                if (data.address.zip) existingRestaurant.address.zip = data.address.zip;
                if (data.address.city) existingRestaurant.address.city = data.address.city;
                if (data.address.state) existingRestaurant.address.state = data.address.state;
                if (data.address.country) existingRestaurant.address.country = data.address.country;
            }

            if (data.socialMedia) {
                if (data.socialMedia.facebook)
                    existingRestaurant.socialMedia.facebook = data.socialMedia.facebook;
                if (data.socialMedia.twitter)
                    existingRestaurant.socialMedia.twitter = data.socialMedia.twitter;
                if (data.socialMedia.instagram)
                    existingRestaurant.socialMedia.instagram = data.socialMedia.instagram;
            }

            if (data.openingHours) {
                if (data.openingHours.weekend) {
                    if (data.openingHours.weekend.start)
                        existingRestaurant.openingHours.weekend.start = new Date(
                            data.openingHours.weekend.start,
                        );

                    if (data.openingHours.weekend.end)
                        existingRestaurant.openingHours.weekend.end = new Date(
                            data.openingHours.weekend.end,
                        );
                }

                if (data.openingHours.weekday) {
                    if (data.openingHours.weekday.start)
                        existingRestaurant.openingHours.weekday.start = new Date(
                            data.openingHours.weekday.start,
                        );

                    if (data.openingHours.weekday.end)
                        existingRestaurant.openingHours.weekday.end = new Date(
                            data.openingHours.weekday.end,
                        );
                }
            }

            if (data.bankAccount) {
                if (data.bankAccount.name) {
                    existingRestaurant.bankAccount.name = data.bankAccount.name;
                }
                if (data.bankAccount.number) {
                    existingRestaurant.bankAccount.number = data.bankAccount.number;
                }
                if (data.bankAccount.IFSC) {
                    existingRestaurant.bankAccount.IFSC = data.bankAccount.IFSC;
                }
            }

            await existingRestaurant.save();

            return res.status(200).json({
                success: true,
                message: 'Restaurant updated successfully',
                restaurant: existingRestaurant,
            });
        } catch (error) {
            console.error('Error updating restaurant: ', error);

            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    },

    getRestaurantByOwner: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                ownerID: z.string().length(24),
            });

            const result = schema.safeParse({ ownerID: res.locals.userID });

            if (!result.success) {
                logger.warn('Validation failed in getRestaurantByOwner controller:', result.error);
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: z.treeifyError(result.error),
                });
            }

            const restaurant = await Restaurant.findOne({
                owner: result.data.ownerID,
            });

            if (!restaurant) {
                logger.warn(
                    `restaurant not found for owner ID: ${result.data.ownerID} in getRestaurantByOwner controller`,
                );
                return res.status(404).json({
                    success: true,
                    found: false,
                    message: 'restaurant not found for this owner',
                });
            }

            return res.status(200).json({
                success: true,
                found: true,
                restaurant,
            });
        } catch (error) {
            logger.error('Error in getRestaurantByOwner controller:', error);

            return res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    },

    addItem: async (req: Request, res: Response) => {
        try {
            const userID = res.locals.userID! as string;

            const schema = z.object({
                dishName: z.string().min(2),
                description: z.string().optional(),
                cuisine: z.enum([
                    'South Indian',
                    'North Indian',
                    'Gujarati',
                    'Chinese',
                    'Italian',
                    'Mexican',
                    'Thai',
                    'Japanese',
                    'American',
                    'Continental',
                    'Mediterranean',
                    'French',
                    'Korean',
                    'Vietnamese',
                    'Middle Eastern',
                    'Fusion',
                    'Other',
                ]),
                foodType: z.enum(['veg', 'non-veg', 'vegan', 'egg']),
                price: z.number(),
                imageURL: z.url(),
                category: z.enum([
                    'Appetizer',
                    'Main Course',
                    'Dessert',
                    'Beverage',
                    'Snack',
                    'Breakfast',
                    'Salad',
                    'Soup',
                ]),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input data',
                    errors: z.treeifyError(result.error),
                });
            }

            const restaurant = await Restaurant.findOne({
                owner: userID,
            });

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found for the owner',
                });
            }

            const newItem = new Item({
                restaurantID: restaurant._id,
                ...result.data,
            });

            await newItem.save();

            return res.status(200).json({
                success: true,
                message: 'Item added successfully',
                data: newItem,
            });
        } catch (error) {
            logger.error('Error in addItem', error);

            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    },

    deleteItem: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                itemID: z.string(),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid item ID provided',
                    errors: z.treeifyError(result.error),
                });
            }

            const { itemID } = result.data;

            const restaurant = await Restaurant.findOne({
                owner: res.locals.userID! as string,
            });

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found for the owner',
                });
            }

            const existingItem = await Item.findOneAndDelete({
                _id: itemID,
                restaurantID: restaurant._id,
            });

            if (!existingItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found or already deleted',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Item deleted successfully',
            });
        } catch (error) {
            logger.error('Error in deleteItem', error);

            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    },

    updateItem: async (req: Request, res: Response) => {
        try {
            const owner = res.locals.userID! as string;

            const schema = z.object({
                itemID: z.string(),
                dishName: z.string().min(2).optional(),
                description: z.string().optional(),
                cuisine: z
                    .enum([
                        'South Indian',
                        'North Indian',
                        'Gujarati',
                        'Chinese',
                        'Italian',
                        'Mexican',
                        'Thai',
                        'Japanese',
                        'American',
                        'Continental',
                        'Mediterranean',
                        'French',
                        'Korean',
                        'Vietnamese',
                        'Middle Eastern',
                        'Fusion',
                        'Other',
                    ])
                    .optional(),
                foodType: z.enum(['veg', 'non-veg', 'vegan', 'egg']).optional(),
                price: z.number().optional(),
                imageURL: z.url().optional(),
                category: z
                    .enum([
                        'Appetizer',
                        'Main Course',
                        'Dessert',
                        'Beverage',
                        'Snack',
                        'Breakfast',
                        'Salad',
                        'Soup',
                    ])
                    .optional(),
                isAvailable: z.boolean().optional(),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid input data',
                    errors: z.treeifyError(result.error),
                });
            }

            const { itemID, ...updateData } = result.data;

            const restaurant = await Restaurant.findOne({
                owner: owner,
            });

            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    message: 'Restaurant not found for the owner',
                });
            }

            const updatedItem = await Item.findOneAndUpdate(
                {
                    _id: itemID,
                    restaurantID: restaurant._id,
                },
                updateData,
                { new: true },
            );

            if (!updatedItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found',
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Item updated successfully',
                item: updatedItem,
            });
        } catch (error) {
            logger.error('Error in updateItem', error);

            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    },

    getItemsByRestaurant: async (req: Request, res: Response) => {
        try {
            const schema = z.object({
                restaurantID: z.string(),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid restaurant ID provided',
                    errors: z.treeifyError(result.error),
                });
            }

            const { restaurantID } = result.data;

            const items = await Item.find({
                restaurantID: restaurantID,
            });

            if (items.length === 0) {
                return res
                    .status(200)
                    .json({ success: true, message: 'No items found', items: [] });
            }

            return res
                .status(200)
                .json({ success: true, message: 'Items retrieved successfully', items });
        } catch (error) {
            logger.error('Error in getItemsByRestaurant', error);
            return res.status(500).json({
                success: false,
                message: 'Internal Server Error',
            });
        }
    },

    getNearByRestaurant: async (req: Request, res: Response) => {
        try {
            const userID = res.locals.userID as string;

            const schema = z.object({
                maxDistance: z.number().optional(),
            });

            const result = schema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    found: false,
                    message: 'Invalid input data',
                    error: z.treeifyError(result.error),
                });
            }

            const { maxDistance } = result.data;

            const user = await User.findById(userID);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    found: false,
                    message: 'User not found',
                });
            }

            const nearByUsers = await User.find({
                location: {
                    $near: {
                        $geometry: user.location,
                        $maxDistance: maxDistance ?? 50000,
                    },
                },
                role: 'owner',
            });

            type RestaurantTuple = [IRestaurant, string, string[]];
            const nearByRestaurants: RestaurantTuple[] = [];

            for (const nearUser of nearByUsers) {
                const isRestaurant = await Restaurant.findOne({ owner: nearUser._id });
                if (isRestaurant) {
                    const allItem = await Item.find({
                        restaurantID: isRestaurant._id,
                    });

                    if (!allItem) {
                        nearByRestaurants.push([isRestaurant, nearUser.cityName, []]);
                        continue;
                    }

                    const st = new Set<string>();
                    for (const item of allItem) {
                        st.add(item.cuisine);
                    }

                    nearByRestaurants.push([isRestaurant, nearUser.cityName, [...st]]);
                }
            }

            nearByRestaurants.sort(
                (
                    [restaurantA, cityA]: RestaurantTuple,
                    [restaurantB, cityB]: RestaurantTuple,
                ): number => {
                    if (cityA !== cityB) {
                        return 0;
                    }

                    const avgA = restaurantA.ratingsCount
                        ? restaurantA.ratingsSum / restaurantA.ratingsCount
                        : 0;

                    const avgB = restaurantB.ratingsCount
                        ? restaurantB.ratingsSum / restaurantB.ratingsCount
                        : 0;

                    return avgB - avgA;
                },
            );

            if (nearByRestaurants.length === 0) {
                return res.status(200).json({
                    success: true,
                    found: false,
                    restaurants: [],
                    message: 'No restaurants found nearby',
                });
            }

            return res.status(200).json({
                success: true,
                found: true,
                restaurants: nearByRestaurants,
                message: 'Nearby restaurants fetched successfully',
            });
        } catch (error) {
            logger.error('Error in getNearByRestaurant', error);

            return res.status(500).json({
                success: false,
                found: false,
                message: 'Internal Server Error',
            });
        }
    },
};

export default controller;
