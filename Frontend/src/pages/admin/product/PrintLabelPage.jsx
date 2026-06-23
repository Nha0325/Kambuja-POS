import { useEffect, useState } from "react";
import Barcode from "react-barcode";

function PrintLabelPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const labels = localStorage.getItem("productsLabel");
    if (labels) {
      const data = JSON.parse(labels);
      setProducts(data);
      setTimeout(() => {
        window.print(); // Auto-print
      }, 1000);
    }
  }, []);

  return (
    <div className="print-area">
      {products?.map((el) => (
        <div key={el.id} className="label">
          <p className="label-text">{el.productName} |<span className="price">${Number(el.salePrice || 0).toFixed(2)}</span>
          </p>
          <div className="barcode-container">
            <Barcode
              value={el.code || "000000"}
              width={1.2} /* Adjusted width for Xprinter */
              height={35} /* Ensures readability */
              format="CODE128"
              fontSize={8} /* Prevents text cutoff */
              margin={2}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default PrintLabelPage;
