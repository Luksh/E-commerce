import Yup from "yup";

export const addItemToCartValidation = Yup.object({
  productId: Yup.string().required("Product ID is required.").trim(),
  orderedQuantity: Yup.number()
    .required("Ordered quantity is required")
    .min(1, "Ordered quantity must be at least 1."),
});
