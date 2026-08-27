"use client";

import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { FiShoppingBag } from "react-icons/fi";
import Button from "@/Components/Button/Button";
import { addComboToCart } from "@/Store/Slices/cartSlice";
import { buildComboCartPayload } from "@/Utils/comboCart";

// The combo detail page's own Add to Cart button — the page itself
// (app/combo-offers/[id]/page.js) is a server component, so this one small
// interactive piece is split out, same pattern as
// Components/Product/ProductDetailInteractive.js on the product page.
export default function ComboOfferAddToCart({ offer }) {
  const dispatch = useDispatch();

  const handleAdd = () => {
    dispatch(addComboToCart(buildComboCartPayload(offer)));
    toast.success(`${offer.title} added to cart`);
  };

  return (
    <Button size="md" icon={FiShoppingBag} className="w-full justify-center sm:w-auto" onClick={handleAdd}>
      Add to Cart
    </Button>
  );
}
