import React from "react";
import hero7 from "../assests/hero7.webp";

const ShowCase = () => {
  return (
    <div className="px-24 py-6 bg-slate-100 my-6">
      <div className="flex items-center justify-around">
        <img className="max-w-[400px]" src={hero7} alt="" srcset="" />
        <div className="max-w-[50%]">
          <h1 className="font-bold mb-2 text-4xl"> # Genuine Cosmetics</h1>
          <h3 className="mt-4 mb-3 text-2xl">Organic cream</h3>
          <p className="text-base font-light">
            The formulation is in fact one of the main distinguishing factors of
            an organic cosmetic. For example, the presence of natural
            ingredients is one of the basic requirements. For this reason,
            organic cosmetics also include natural cosmetics, i.e. products made
            from completely natural and therefore chemical-free ingredients. In
            addition to respecting our skin, organic cosmetics should also
            respect nature, plants and animals.
          </p>
          <h3 className="mt-4 mb-3 text-2xl">Natural extracts</h3>
          <p className="text-base font-light">
            The use of bioactive extracts or phytochemicals from a variety of
            botanicals in cosmetics accomplishes two functions: care of the body
            and as ingredients to influence the biological functions of the
            skin, providing the nutrients for healthy skin. Generally, botanical
            products are a rich source of vitamins, antioxidants, essential oils
            and oils, hydrocolloids, proteins, terpenoids and other bioactive
            compounds.
          </p>
          <h3 className="mt-4 mb-3 text-2xl">Quality assurance</h3>
          <p className="text-base font-light">
            Quality does not merely mean the goodness of a finished
            product.Various checks and balances to produce quality products are
            referred to as Quality Control.Procedure involves drawing of random
            samples from production line at different intervals and these
            samples are inspected and if the product quality is found below the
            standard.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShowCase;
