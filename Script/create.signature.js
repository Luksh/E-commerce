import crypto from "crypto";

const getSignature = () => {
  const randomText = crypto.randomBytes(20).toString("hex");

  console.log(randomText);
};

getSignature();
