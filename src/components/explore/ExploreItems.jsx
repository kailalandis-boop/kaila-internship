import React, { useState, useEffect } from "react"; 
import { Link } from "react-router-dom"; 
import axios from "axios"; import AuthorImage from "../../images/author_thumbnail.jpg"; 
import nftImage from "../../images/nftImage.jpg";
import Skeleton from "../UI/Skeleton";
import Countdown from "../UI/Countdown";
import AOS from "aos";
import "aos/dist/aos.css";

const ExploreItems = () => { 
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(""); 
  const [filter, setFilter] = useState("");
  const [visibleItems, setVisibleItems] = useState(8); 
  const loadMoreItems = () => {
    setVisibleItems((prev) => prev + 4);
  };
  const sortedItems = [...items].sort((a, b) => {
    if (filter === "price_low_to_high") {
      return Number(a.price) - Number(b.price);
    }

    if (filter === "price_high_to_low") {
      return Number(b.price) - Number(a.price);
    }

    if (filter === "likes_high_to_low") {
      return Number(b.likes) - Number(a.likes);
    }

    return 0;
  });

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
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/explore"
        );

        setItems(response.data);
      } catch (error) {
        console.error("Error fetching Explore items:", error);
        setError("Unable to load NFTs.");
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };

    fetchItems();
  }, []);

  useEffect(() => {
    setVisibleItems(8);
  }, [filter]);
  
  return ( 
    <> 
      <div data-aos="fade-in"> 
        <select 
          id="filter-items" 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)} 
        > 
          <option value="">Default</option> 
          <option value="price_low_to_high"> Price, Low to High </option> 
          <option value="price_high_to_low"> Price, High to Low </option> 
          <option value="likes_high_to_low"> Most liked </option> 
        </select> 
      </div>
      
      <div className="row"> 
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div
              className="col-lg-3 col-md-6 col-sm-6 col-xs-12"
              key={index}
            >
              <div className="nft__item explore-skeleton-card">

                {/* Author image */}
                <div className="explore-skeleton-author">
                  <Skeleton
                    width="100px"
                    height="100px"
                    borderRadius="50%"
                  />
                </div>

                {/* NFT artwork */}
                <div className="explore-skeleton-artwork">
                  <Skeleton
                    width="100%"
                    height="100%"
                    borderRadius="12px"
                  />
                </div>

                {/* NFT information */}
                <div className="explore-skeleton-info">

                  {/* NFT title */}
                  <Skeleton
                    width="75%"
                    height="28px"
                    borderRadius="5px"
                  />

                  {/* Price and likes */}
                  <div className="explore-skeleton-bottom">
                    <Skeleton
                      width="90px"
                      height="25px"
                      borderRadius="5px"
                    />

                    <Skeleton
                      width="65px"
                      height="25px"
                      borderRadius="5px"
                    />
                  </div>

                </div>
              </div>
            </div>
          ))
        ) : error ? (
          <p>{error}</p>
        ) : (
          sortedItems.slice(0, visibleItems).map((item, index) => (
            <div
              key={item.id || index}
              className="d-item col-lg-3 col-md-6 col-sm-6 col-xs-12"
              data-aos="fade-in"
              data-aos-delay={(index % 4) * 100}
              style={{
                display: "block",
                backgroundSize: "cover",
              }}
            >
              <div className="nft__item"> 
                <div className="author_list_pp"> 
                  <Link
                    to={`/author/${item.authorId === 1 ? 83937449 : item.authorId}`}
                    state={{
                      author: {
                        authorId: item.authorId === 1 ? 83937449 : item.authorId,
                        authorImage: item.authorImage,
                        authorName:
                          item.authorId === 1 ? "Monica Lucas" : item.authorName,
                      },
                    }}
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                  >
                  <img 
                    className="lazy" 
                    src={item.authorImage || AuthorImage} 
                    alt="NFT creator" 
                  /> 
                  <i className="fa fa-check"></i> 
                  </Link> 
                </div> 
                <Countdown expiryDate={item.expiryDate} /> 
                <div className="nft__item_wrap"> 
                  <div className="nft__item_extra"> 
                    <div className="nft__item_buttons"> 
                      <button>Buy Now</button> 
                      <div className="nft__item_share"> 
                        <h4>Share</h4> 
                        <a 
                          href="" 
                          target="_blank" 
                          rel="noreferrer" 
                        > 
                          <i className="fa fa-facebook fa-lg"></i> 
                        </a> 
                        <a 
                          href="" 
                          target="_blank" 
                          rel="noreferrer" 
                        > 
                          <i className="fa fa-twitter fa-lg"></i> 
                        </a> 
                        <a href=""> 
                          <i className="fa fa-envelope fa-lg"></i> 
                        </a> 
                      </div> 
                    </div> 
                  </div> 
                  <Link to={`/item-details/${item.nftId}`} state={{ item }}>
                    <img 
                      src={item.nftImage || nftImage} 
                      className="lazy nft__item_preview" 
                      alt={item.title || "NFT"} 
                    /> 
                  </Link> 
                </div> 
                
                <div className="nft__item_info"> 
                  <Link to={`/item-details/${item.nftId}`} state={{ item }}> 
                    <h4>{item.title || "Untitled NFT"}</h4> 
                  </Link> 
                  
                  <div className="nft__item_price"> 
                    {item.price ?? "N/A"} ETH 
                  </div> 
                  <div className="nft__item_like"> 
                    <i className="fa fa-heart"></i> 
                    <span>{item.likes ?? 0}</span> 
                  </div> 
                </div> 
              </div>
            </div> 
          )) 
        )} 
      </div> 
      {!loading && !error && visibleItems < sortedItems.length && (
        <div className="col-md-12 text-center" data-aos="fade-in">
          <button
            id="loadmore"
            className="btn-main lead"
            onClick={loadMoreItems}
          >
            Load More
          </button>
        </div>
      )}
    </> 
  ); 
}; 

export default ExploreItems;