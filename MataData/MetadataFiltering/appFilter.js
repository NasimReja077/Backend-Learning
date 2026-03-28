const applyFilters = (items, filters) => {
  return items.filter(item => {
    let valid = true;

    // Date filter
    if (filters.dateAfter) {
      valid = valid && new Date(item.metadata.date) > new Date(filters.dateAfter);
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      valid = valid && filters.tags.some(tag =>
        item.metadata.tags.includes(tag)
      );
    }

    // Source filter
    if (filters.source) {
      valid = valid && item.metadata.source === filters.source;
    }

    return valid;
  });
};