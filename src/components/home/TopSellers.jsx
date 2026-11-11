
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Skeleton from "../UI/Skeleton";
import AOS from "aos";
import "aos/dist/aos.css";

const TopSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    AOS.init({
      offset: 150,
      duration: 800,
      easing: "ease-in-sine",
      once: true,
      mirror: false,
    });
  }, []);

  useEffect(() => {
    let timer;
    let isMounted = true;

    const controller = new AbortController();

    const fetchSellers = async () => {
      try {
        const response = await axios.get(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/topSellers",
          {
            signal: controller.signal,
          }
        );

        if (isMounted) {
          console.log("Top Sellers API data:", response.data);

          setSellers(
            Array.isArray(response.data) ? response.data : []
          );
        }
      } catch (error) {
        if (isMounted && !axios.isCancel(error)) {
          console.error("Error fetching top sellers:", error);
          setError("Unable to load top sellers.");
        }
      } finally {
        if (isMounted) {
          timer = setTimeout(() => {
            setLoading(false);
          }, 1500);
        }
      }
    };

    fetchSellers();

    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, []);

  return (
    <section id="section-popular" className="pb-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-12" data-aos="fade-up">
            <div className="text-center">
              <h2>Top Sellers</h2>
              <div className="small-border bg-color-2"></div>
            </div>
          </div>

          <div className="col-md-12">
            {error ? (
              <p>{error}</p>
            ) : (
              <ol className="author_list">
                {loading ? (
                  new Array(12).fill(0).map((_, index) => (
                    <li key={index}>
                      <div className="author_list_pp">
                        <Skeleton
                          width="50px"
                          height="50px"
                          borderRadius="50%"
                        />
                      </div>

                      <div className="author_list_info">
                        <Skeleton
                          width="120px"
                          height="16px"
                          borderRadius="5px"
                        />

                        <Skeleton
                          width="70px"
                          height="14px"
                          borderRadius="5px"
                        />
                      </div>
                    </li>
                  ))
                ) : (
                  sellers.map((seller) => (
                    <li key={seller.id} data-aos="fade-up">
                      <div className="author_list_pp">
                        <Link
                          to={`/author/${seller.authorId}`}
                          state={{ author: seller }}
                        >
                          <img
                            className="lazy pp-author"
                            src={seller.authorImage}
                            alt={seller.authorName}
                          />
                          <i className="fa fa-check"></i>
                        </Link>
                      </div>

                      <div className="author_list_info">
                        <Link
                          to={`/author/${seller.authorId}`}
                          state={{ author: seller }}
                        >
                          {seller.authorName}
                        </Link>

                        <span>{seller.price} ETH</span>
                      </div>
                    </li>
                  ))
                )}
              </ol>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopSellers;