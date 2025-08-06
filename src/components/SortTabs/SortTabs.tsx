import { useState } from "react";
import classes from './sortTabs.module.css'

type SortTabsProps = {
  value: string;
  onChange: (value: string) => void;
};

export const SortTabs = ({ value, onChange }: SortTabsProps) => {
  const options = [
    { value: "dateAdded", label: "Last added" },
    { value: "releaseDate", label: "Newest" },
    { value: "name", label: "Oldest" },
  ];

  return (
    <div className="flex space-x-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            console.log('SortTabs button clicked:', option.value);
            onChange(option.value);
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`px-4 py-2 text-sm font-medium transition-colors border ${
            value === option.value
              ? "bg-violet-900 text-white border-violet-900"
              : "bg-white text-violet-900 border-violet-900 hover:bg-violet-50"
          } ${classes.custom_tab}`}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};