import { Button, Carousel } from "antd";
import hero1 from "../assests/hero1.webp";
import hero2 from "../assests/hero2.webp";
import hero6 from "../assests/hero6.webp";
import hero5 from "../assests/hero5.webp";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useNavigate } from "react-router-dom";
const Hero = () => {
  const contentStyle = {
    height: "92vh",
    color: "#fff",
    // lineHeight: "92vh",
    textAlign: "center",
    width: "100vw",
    objectFit: "cover",
    background: "#364d79",
  };

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2500,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    pauseOnHover: true,
  };
  const heroArray = [
    {
      img: hero6,
      title: "New Beauty Trend",
      description: "Discover our collection for this new hot season",
    },
    {
      img: hero2,
      title: "New Beauty Trend",
      description: "Discover our collection for this new hot season",
    },
    {
      img: hero1,
      title: "New Beauty Trend",
      description: "Discover our collection for this new hot season",
    },
    {
      img: hero5,
      title: "New Beauty Trend",
      description: "Discover our collection for this new hot season",
    },
  ];
  const navigate = useNavigate();
  return (
    <div className="relative">
      <Slider {...settings}>
        {heroArray.map((hero) => {
          return (
            <div style={contentStyle} className="relative">
              <img
                className="h-[100vh] object-cover w-[100%]"
                src={hero.img}
                alt=""
              />
              <div className="font-[Urbanist] absolute top-[50%] left-[10%] translate-y-[-50%]">
                <h1 className="font-bold text-5xl">{hero.title}</h1>
                <p className="font-semibold text-2xl mb-4 mt-2">
                  {hero.description}
                </p>
                <button onClick={() => navigate('/products')} className="text-xl px-8 py-3 hover:text-white hover:bg-black transition duration-300 text-black border-[2px] border-black cursor-pointer">
                  BUY NOW
                </button>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};
export default Hero;
