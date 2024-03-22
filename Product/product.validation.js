import Yup from "yup";

export const addProductValidation = Yup.object({
  name: Yup.string().trim().required("Name is required.").max(50, "Name should be less than 50 characters."),
  brand: Yup.string().trim().required("Brand is required.").max(50, "Brand should be less than 50 characters."),
  price: Yup.number().required("Price is required.").min(0, "Price should not be less than 0."),
  category: Yup.string()
    .trim()
    .required("Category is required.")
    .oneOf([
      "Electronics",
      "Clothing",
      "Shoes",
      "Books",
      "Home",
      "Beauty",
      "Toys",
      "Sports",
      "Outdoors",
      "Tools",
      "Grocery",
      "Health",
      "Automotive",
      "Industrial",
      "Handmade",
      "Jewelry",
      "Music",
      "Furniture",
      "Kids",
      "Other",
    ]),
  freeShipping: Yup.boolean().default(false),
  availableQuantity: Yup.number().integer().required().min(1, "Quantity should be greater than 0."),
  description: Yup.string()
    .trim()
    .required("Description is required.")
    .min(100, "Description must be at least 100 characters.")
    .max(1000, "Description should not be greater than 1000 characters."),
});
