/**
 * Debounce utility to limit the rate at which a function can fire
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to wait
 * @param {boolean} immediate - Whether to execute the function on the leading edge
 * @returns {Function} - The debounced function with cancel method
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;

  const debounced = function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };

  // Add cancel method to the debounced function
  debounced.cancel = () => {
    clearTimeout(timeout);
    timeout = null;
  };

  return debounced;
};
