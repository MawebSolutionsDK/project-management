"use client";

import { useState } from "react";

interface ProductOption {
  id: string;
  name: string;
  default_price: number;
}

export function ProductPriceField({
  products,
  productFieldName,
  priceFieldName,
  priceLabel,
  defaultProductId,
  defaultPrice,
  required = true,
}: {
  products: ProductOption[];
  productFieldName: string;
  priceFieldName: string;
  priceLabel: string;
  defaultProductId?: string | null;
  defaultPrice?: string;
  required?: boolean;
}) {
  const [price, setPrice] = useState(defaultPrice ?? "");

  function handleProductChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const product = products.find((p) => p.id === e.target.value);
    if (product) {
      setPrice(String(product.default_price));
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label className="label">Produkt (valgfrit)</label>
        <select
          name={productFieldName}
          defaultValue={defaultProductId ?? ""}
          onChange={handleProductChange}
          className="input"
        >
          <option value="">Intet produkt / brugerdefineret</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.default_price.toLocaleString("da-DK")} kr.)
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-ink/45">Prisen udfyldes automatisk, men kan altid tilpasses.</p>
      </div>
      <div>
        <label className="label">{priceLabel}</label>
        <input
          type="number"
          name={priceFieldName}
          required={required}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="input"
        />
      </div>
    </div>
  );
}
