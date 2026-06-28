exports.convertToBaseQty = (qty, selectedUnitCode, product) => {
    if (!product || !product.unitConfig) return qty;
    if (selectedUnitCode === product.unitConfig.baseUnit?.code) return qty;
    if (selectedUnitCode === product.unitConfig.purchaseUnit?.code) {
        return qty * (product.unitConfig.unitsPerPurchaseUnit || 1);
    }
    // Check if it's one of the sale units (though normally they match base or purchase)
    const saleUnit = product.unitConfig.saleUnits?.find(u => u.code === selectedUnitCode);
    if (saleUnit) {
        if (saleUnit.code === product.unitConfig.baseUnit?.code) return qty;
        if (saleUnit.code === product.unitConfig.purchaseUnit?.code) return qty * (product.unitConfig.unitsPerPurchaseUnit || 1);
    }
    throw new Error("Invalid unit selected for this product");
};

exports.formatStockDisplay = (stockQtyBase, unitsPerPurchaseUnit, purchaseUnitName, baseUnitName) => {
    if (!unitsPerPurchaseUnit || unitsPerPurchaseUnit <= 1) {
        return `${stockQtyBase} ${baseUnitName}`;
    }
    const caseQty = Math.floor(stockQtyBase / unitsPerPurchaseUnit);
    const remainQty = stockQtyBase % unitsPerPurchaseUnit;
    
    if (caseQty === 0) return `${remainQty} ${baseUnitName}`;
    if (remainQty === 0) return `${caseQty} ${purchaseUnitName}`;
    return `${caseQty} ${purchaseUnitName} ${remainQty} ${baseUnitName}`;
};

exports.calculateCostPerBaseUnit = (costPerPurchaseUnit, unitsPerPurchaseUnit) => {
    if (!unitsPerPurchaseUnit) return costPerPurchaseUnit;
    return costPerPurchaseUnit / unitsPerPurchaseUnit;
};

exports.validateStock = (product, convertedQtyBase) => {
    const stockBase = product.stock !== undefined ? product.stock : product.stockQtyBase !== undefined ? product.stockQtyBase : product.currentStock;
    if (stockBase < convertedQtyBase) {
        throw new Error(`Insufficient stock. Only ${stockBase} base units available.`);
    }
    return true;
};
