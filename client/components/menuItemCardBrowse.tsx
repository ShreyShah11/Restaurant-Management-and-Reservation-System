import React from "react";
import { Card } from "@/components/ui/card";
import { IndianRupeeIcon } from "lucide-react";

type MenuItem = {
  _id: string;
  dishName: string;
  description?: string;
  price: number;
  imageURL?: string;
  foodType?: "veg" | "non-veg" | "vegan" | "egg";
};

const FoodTypeDot: React.FC<{ type?: MenuItem["foodType"] }> = ({ type }) => {
  const colors: Record<string, string> = {
    veg: "bg-green-500",
    "non-veg": "bg-red-500",
    vegan: "bg-emerald-500",
    egg: "bg-yellow-500",
  };

  return (
    <span
      className={`inline-block w-3 h-3 rounded-full ${
        type ? colors[type] : "bg-gray-400"
      }`}
    ></span>
  );
};

const MenuItemCard: React.FC<{ item: MenuItem }> = ({ item }) => {
  return (
    <div className="relative group w-fit">
      {/* CARD */}
      <Card
        className="
          min-w-[200px] h-[220px] rounded-xl overflow-hidden relative cursor-pointer 
          shadow-md hover:shadow-xl transition-all duration-300
        "
      >
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={item.imageURL}
            alt={item.dishName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>

        {/* Content inside image */}
        <div className="absolute bottom-0 left-0 w-full p-3 text-white z-20">
          <div className="flex items-center gap-2 mb-1">
            <FoodTypeDot type={item.foodType} />
            <span className="text-xs opacity-90">{item.foodType}</span>
          </div>

          <h3 className="text-lg font-semibold leading-tight">{item.dishName}</h3>

          <div className="flex items-center gap-1 mt-1 text-sm font-medium">
            <IndianRupeeIcon className="w-4 h-4" />
            {item.price}
          </div>
        </div>
      </Card>

    </div>
  );
};

export default MenuItemCard;
