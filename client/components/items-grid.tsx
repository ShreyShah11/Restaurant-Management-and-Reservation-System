'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, Star, ToggleLeft as Toggle2 } from 'lucide-react';
import type { Item } from '@/store/restaurant';
import { FOOD_TYPE_LABELS, FOOD_TYPE_COLORS } from '@/constants/food-types';
import type { ItemsGridProps } from './items-grid-props';
import { useRestaurantData } from '@/store/restaurant';
import { backend } from '@/config/backend';
import { AxiosError } from 'axios';
import { Toast } from './Toast';

export function ItemsGrid({ items, onEdit, onDelete }: ItemsGridProps) {
    const { toggleItemPopular, toggleItemAvailability } = useRestaurantData();
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    const toggleExpanded = (itemId: string): void => {
        const newExpanded: Set<string> = new Set(expandedItems);
        if (newExpanded.has(itemId)) {
            newExpanded.delete(itemId);
        } else {
            newExpanded.add(itemId);
        }
        setExpandedItems(newExpanded);
    };
    const onClick = async (id: string) => {
      try {
        toggleItemAvailability(id);
    
        const item = items.find((item) => item._id === id);
    
        const { data } = await backend.post('/api/v1/restaurants/update-item', {
          itemID: id,
          isAvailable: !item?.isAvailable,
        });
        console.log("d ",data)
    
        Toast.success(data?.message || 'Item availability updated successfully');
      } catch (error: unknown) {
        const err = error as AxiosError<{ message: string }>;
    
        if (err.response?.data?.message) {
          Toast.error(err.response.data.message);
          return;
        }
    
        if (err.message) {
          Toast.error(`Something went wrong: ${err.message}`);
          return;
        }
    
        Toast.error('An unexpected error occurred. Please try again.');
      }
    };
    

    const isExpanded = (itemId: string): boolean => expandedItems.has(itemId);

    return (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {items.map((item: Item) => (
                <Card
                    key={item._id}
                    className="overflow-hidden transition-all duration-300 hover:shadow-lg  group border-border/60 hover:border-primary/60 flex flex-col"
                >
                    {/* Image Section */}
                    <div className="relative h-40 w-full bg-linear-to-br from-muted/50 to-muted overflow-hidden">
                        {item.imageURL ? (
                            <img
                                src={item.imageURL || '/placeholder.svg'}
                                alt={item.dishName}
                                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/10 via-primary/5 to-muted">
                                <div className="text-center">
                                    <div className="text-3xl mb-1">🍽️</div>
                                    <span className="text-xs text-muted-foreground font-medium">
                                        No image
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Food Type Badge */}
                        <div className="absolute right-2 top-2 flex gap-2">
                            {item.isPopular && (
                                <Badge className="bg-yellow-500 text-white text-xs font-medium px-2 py-1 shadow-md flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-white" />
                                    Popular
                                </Badge>
                            )}
                            <Badge
                                className={`${FOOD_TYPE_COLORS[item.foodType] || 'bg-gray-100 text-gray-800'} text-xs font-medium px-2 py-1 shadow-md`}
                            >
                                {FOOD_TYPE_LABELS[item.foodType]}
                            </Badge>
                        </div>

                        {!item.isAvailable && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                    Unavailable
                                </span>
                            </div>
                        )}
                    </div>

                    <CardContent className="p-4 flex flex-col flex-1">
                        {/* Title and Price */}
                        <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-1 leading-snug">
                            {item.dishName}
                        </h3>

                        {/* Description */}
                        {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                {item.description}
                            </p>
                        )}

                        {/* Price and Category */}
                        <div className="flex items-center justify-between mb-3 gap-2">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Price</span>
                                <span className="text-lg font-bold text-primary">
                                    ₹{item.price.toFixed(0)}
                                </span>
                            </div>
                            <Badge variant="secondary" className="text-xs px-2 py-1 shrink-0">
                                {item.category}
                            </Badge>
                        </div>

                        {isExpanded(item._id) && (
                            <div className="mb-3 p-3 bg-muted/50 rounded-lg border border-border/40 space-y-2">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">
                                        Full Description
                                    </p>
                                    <p className="text-xs text-foreground leading-relaxed">
                                        {item.description || 'No description provided'}
                                    </p>
                                </div>
                                <div className="flex gap-2 flex-wrap pt-2 border-t border-border/40">
                                    <Badge variant="outline" className="text-xs">
                                        {item.cuisine}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        {item.foodType}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-auto pt-3 border-t border-border/40">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 h-8 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => toggleExpanded(item._id)}
                            >
                                {isExpanded(item._id) ? 'Hide' : 'Details'}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className={`h-8 px-2 transition-colors ${
                                    item.isAvailable
                                        ? 'hover:bg-green-500/10 hover:text-green-600 text-green-600'
                                        : 'hover:bg-red-500/10 hover:text-red-600 text-red-600'
                                }`}
                                onClick={() => onClick(item._id)}
                                title={
                                    item.isAvailable
                                        ? 'Click to mark unavailable'
                                        : 'Click to mark available'
                                }
                            >
                                <Toggle2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Edit and Delete Buttons */}
                        <div className="flex gap-2 mt-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 h-8 text-xs font-medium hover:bg-yellow-500/10 hover:text-yellow-600 transition-colors"
                                onClick={() => toggleItemPopular(item._id)}
                            >
                                <Star
                                    className={`h-4 w-4 mr-1 ${item.isPopular ? 'fill-yellow-500 text-yellow-500' : ''}`}
                                />
                                {item.isPopular ? 'Popular' : 'Star'}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 h-8 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => onEdit(item)}
                            >
                                <Edit2 className="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="flex-1 h-8 text-xs font-medium text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                                onClick={() => onDelete(item)}
                            >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
