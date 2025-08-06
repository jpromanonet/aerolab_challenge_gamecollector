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
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            value === option.value
              ? "bg-violet-900 text-white"
              : " text-violet-900 "
          } ${classes.custom_tab}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};