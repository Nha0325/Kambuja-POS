/**
 * Unit helper — SIMPLIFIED (unit system removed)
 * These functions now pass-through base quantities directly.
 * Legacy unit conversion logic has been removed.
 */

/**
 * Convert to base quantity.
 * With the unit system removed, this simply returns the input quantity as-is.
 */
function convertToBaseQty(quantity) {
  return quantity
}

module.exports = { convertToBaseQty }
