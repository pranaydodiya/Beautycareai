import React from "react";
import { Helmet } from "react-helmet";

const Meta = ({ title, description, keywords }) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
    </Helmet>
  );
};
Meta.defaultProps = {
  title: "Shringar - Pride of women",
  description: "We sell the best products at affordable prices",
  keywords: "makeup, buy cosmetics, affordable cosmetics",
};

export default Meta;
