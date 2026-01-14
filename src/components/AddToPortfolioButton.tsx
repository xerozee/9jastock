"use client";

import { useState } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AddToPortfolioButtonProps {
  symbol: string;
  isInPortfolio: boolean;
  onAdd: (symbol: string) => Promise<boolean>;
  onRemove: (symbol: string) => Promise<boolean>;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function AddToPortfolioButton({
  symbol,
  isInPortfolio,
  onAdd,
  onRemove,
  size = "md",
  showLabel = false,
}: AddToPortfolioButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsLoading(true);
    try {
      if (isInPortfolio) {
        await onRemove(symbol);
      } else {
        await onAdd(symbol);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 22,
  };

  if (showLabel) {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
          isInPortfolio
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-green-600 text-white hover:bg-green-700"
        } disabled:opacity-50`}
      >
        {isLoading ? (
          <Loader2 size={iconSize[size]} className="animate-spin" />
        ) : isInPortfolio ? (
          <Check size={iconSize[size]} />
        ) : (
          <Plus size={iconSize[size]} />
        )}
        <span>{isInPortfolio ? "In Portfolio" : "Add to Portfolio"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      title={isInPortfolio ? "Remove from portfolio" : "Add to portfolio"}
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all ${
        isInPortfolio
          ? "bg-green-100 text-green-600 hover:bg-green-200"
          : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600"
      } disabled:opacity-50`}
    >
      {isLoading ? (
        <Loader2 size={iconSize[size]} className="animate-spin" />
      ) : isInPortfolio ? (
        <Check size={iconSize[size]} />
      ) : (
        <Plus size={iconSize[size]} />
      )}
    </button>
  );
}
