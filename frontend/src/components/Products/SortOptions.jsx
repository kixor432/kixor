import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";

const SortOptions = () => {

    const [searchParams, setSearchParams] = useSearchParams();

    const handleSortChange = (e) => {
        const sortBy = e.target.value;
        searchParams.set("sortBy", sortBy)
        setSearchParams(searchParams)
    }

  return (
    <div className=" flex items-center justify-end">
      <select
        id="sort"
        onChange={handleSortChange}
        value={searchParams.get("sortBy") || ""}
        className="border border-gray-200 p-2 h-10 rounded-md focus:outline-none"
      >
        <option value="">Default</option>
        <option value="priceAsc">Price: Low to High</option>
        <option value="priceDesc">Price: High to Low</option>
        <option value="popularity">Popularity</option>
      </select>
    </div>
  );
};

export default SortOptions;
