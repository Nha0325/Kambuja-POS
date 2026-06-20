/**
 * Determines the payment status of a sale.
 * 
 * @param {number} totalCost - The total amount of the sale.
 * @param {number} paidAmount - The total amount paid so far.
 * @returns {string} 'paid' | 'partial' | 'due'
 */
const calculatePaymentStatus = (totalCost, paidAmount) => {
    const total = Number(totalCost) || 0;
    const paid = Number(paidAmount) || 0;

    if (total <= 0) return "paid";      // Nothing owed is considered paid
    if (paid <= 0) return "due";       // No payment made
    if (paid >= total) return "paid";  // Fully paid or overpaid
    return "partial";                  // Payment is between 0 and total
};

module.exports = calculatePaymentStatus;