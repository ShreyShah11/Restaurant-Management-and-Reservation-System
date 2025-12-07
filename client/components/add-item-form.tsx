"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Item } from "@/store/restaurant";
import { CATEGORIES } from "@/constants/categories";
import { PremiumImageUpload } from "@/components/image-upload";

interface FormDataState {
  dishName: string;
  description: string;
  cuisine: string;
  foodType: "veg" | "non-veg" | "vegan" | "egg";
  price: number;
  imageURL: string;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
}

interface AddItemFormProps {
  initialData?: Item;
  onSubmit: (
    data: Omit<Item, "_id" | "restaurantID" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  onClose: () => void;
}

const CUISINES = [
  "South Indian",
  "North Indian",
  "Gujarati",
  "Chinese",
  "Italian",
  "Mexican",
  "Thai",
  "Japanese",
  "American",
  "Continental",
  "Mediterranean",
  "French",
  "Korean",
  "Vietnamese",
  "Middle Eastern",
  "Fusion",
  "Other",
] as const;

const FOOD_TYPE_OPTIONS: Array<{
  value: "veg" | "non-veg" | "vegan" | "egg";
  label: string;
}> = [
  { value: "veg", label: "Vegetarian" },
  { value: "non-veg", label: "Non-Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "egg", label: "Egg" },
];

export function AddItemForm({
  initialData,
  onSubmit,
  onClose,
}: AddItemFormProps): React.JSX.Element {
  const [formData, setFormData] = useState<FormDataState>({
    dishName: initialData?.dishName ?? "",
    description: initialData?.description ?? "",
    cuisine: initialData?.cuisine ?? "",
    foodType: initialData?.foodType ?? "veg",
    price: initialData?.price ?? 0,
    imageURL: initialData?.imageURL ?? "",
    category: initialData?.category ?? "",
    isAvailable: initialData?.isAvailable ?? true, // default true
    isPopular: initialData?.isPopular ?? false,    // default false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (url: string): void => {
    setFormData((prev) => ({ ...prev, imageURL: url }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.dishName.trim().length > 0 &&
    formData.cuisine.trim().length > 0 &&
    formData.category.trim().length > 0 &&
    formData.foodType.trim().length > 0 &&
    formData.imageURL.trim().length > 0 &&
    formData.price > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ✅ Image Upload */}
      <PremiumImageUpload
        label="Item Image"
        onImageUpload={handleImageUpload}
        value={formData.imageURL}
        required={true}
        preset="item_logo"
      />

      {/* Dish Name */}
      <div className="space-y-2">
        <Label htmlFor="dishName">Dish Name *</Label>
        <Input
          id="dishName"
          value={formData.dishName}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, dishName: e.target.value }))
          }
          placeholder="Enter dish name"
          required
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Enter dish description"
          rows={3}
        />
      </div>

      {/* Cuisine */}
      <div className="space-y-2">
        <Label htmlFor="cuisine">Cuisine *</Label>
        <Select
          value={formData.cuisine}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, cuisine: value }))
          }
        >
          <SelectTrigger id="cuisine">
            <SelectValue placeholder="Select cuisine" />
          </SelectTrigger>
          <SelectContent>
            {CUISINES.map((cuisine) => (
              <SelectItem key={cuisine} value={cuisine}>
                {cuisine}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Food Type */}
      <div className="space-y-2">
        <Label htmlFor="foodType">Food Type *</Label>
        <Select
          value={formData.foodType}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              foodType: value as "veg" | "non-veg" | "vegan" | "egg",
            }))
          }
        >
          <SelectTrigger id="foodType">
            <SelectValue placeholder="Select food type" />
          </SelectTrigger>
          <SelectContent>
            {FOOD_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">Price (₹) *</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              price: Number.parseInt(e.target.value) || 0,
            }))
          }
          placeholder="Enter price"
          required
          step="1"
          min="0"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !isFormValid}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : initialData ? (
          "Update Item"
        ) : (
          "Add Item"
        )}
      </Button>
    </form>
  );
}
