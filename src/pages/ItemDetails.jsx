import EthImage from "../images/ethereum.svg";
import { Link, useLocation, useParams } from "react-router-dom";
import AuthorImage from "../images/author_thumbnail.jpg";
import nftImage from "../images/nftImage.jpg";
import { useEffect, useState } from "react";
import axios from "axios";
import Skeleton from "../components/UI/Skeleton";

const ItemDetails = () => {
  const location = useLocation();
  const selectedItem = location.state?.item;
  const { nftId } = useParams();
  const [itemDetails, setItemDetails] = useState(null);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Use API details when available, otherwise use the clicked item.
  const item = itemDetails || selectedItem;

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    let timer;
    let isMounted = true;
    const controller = new AbortController();

    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch the NFT details.
        const response = await axios.get(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/itemDetails",
          {
            params: {
              nftId: nftId,
            },
            signal: controller.signal,
          }
        );

        console.log("Item Details API:", response.data);

        const fetchedItem = Array.isArray(response.data)
          ? response.data[0]
          : response.data.item || response.data;

        if (!fetchedItem) {
          throw new Error("No NFT details returned.");
        }

        if (!isMounted) return;

        setItemDetails(fetchedItem);

        // Fetch the owner using ownerId.
        const ownerId = fetchedItem.ownerId;

        if (ownerId) {
          try {
            const authorResponse = await axios.get(
              "https://us-central1-nft-cloud-functions.cloudfunctions.net/topSellers",
              {
                signal: controller.signal,
              }
            );

            const author = authorResponse.data.find(
              (seller) => seller.authorId === ownerId
            );

            if (isMounted) {
              setAuthorInfo(
                author || {
                  authorId: fetchedItem.ownerId,
                  authorName: fetchedItem.ownerName,
                  authorImage: fetchedItem.ownerImage,
                }
              );
            }
          } catch (error) {
            if (!controller.signal.aborted) {
              console.log("Error fetching owner:", error);

              if (isMounted) {
                setAuthorInfo({
                  authorId: fetchedItem.ownerId,
                  authorName: fetchedItem.ownerName,
                  authorImage: fetchedItem.ownerImage,
                });
              }
            }
          }
        }
      } catch (error) {
        if (isMounted && !controller.signal.aborted) {
          console.log("Error fetching item details:", error);
          setError("Unable to load item details.");
        }
      } finally {
        if (isMounted) {
          timer = setTimeout(() => {
            setLoading(false);
          }, 1500);
        }
      }
    };

    if (nftId) {
      fetchItemDetails();
    } else {
      setError("NFT ID is missing.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [nftId]);

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div id="wrapper" className="item-details-page">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section
          id="section-hero"
          aria-label="section"
          className="no-top no-bottom"
        >
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                {loading ? (
                  <Skeleton
                    width="100%"
                    height="500px"
                    borderRadius="10px"
                  />
                ) : (
                  <img
                    src={item?.nftImage || nftImage}
                    className="img-fluid"
                    alt={item?.title || "NFT"}
                  />
                )}
              </div>

              <div className="col-lg-6">
                <div className="item_info">
                  <h2>
                    {loading ? (
                      <Skeleton
                        width="70%"
                        height="35px"
                        borderRadius="5px"
                      />
                    ) : (
                      item?.title
                    )}
                  </h2>

                  <div className="item_info_counts">
                    <div className="item_info_type">
                      <i className="fa fa-image"></i>
                      NFT
                    </div>

                    <div className="item_info_views">
                      <i className="fa fa-eye"></i>
                      {loading ? (
                        <Skeleton
                          width="35px"
                          height="18px"
                          borderRadius="5px"
                        />
                      ) : (
                        item?.views ?? 0
                      )}
                    </div>

                    <div className="item_info_like">
                      <i className="fa fa-heart"></i>
                      {loading ? (
                        <Skeleton
                          width="35px"
                          height="18px"
                          borderRadius="5px"
                        />
                      ) : (
                        item?.likes ?? 0
                      )}
                    </div>
                  </div>
                  {loading ? (
                    <div>
                      <Skeleton
                        width="100%"
                        height="60px"
                        borderRadius="5px"
                      />
                    </div>
                  ) : (
                    <p>{item?.description}</p>
                  )}
                  <div className="d-flex flex-row">
                    <div className="mr40">
                      <h6>Creator</h6>
                      {loading ? (
                        <Skeleton
                          width="150px"
                          height="50px"
                          borderRadius="5px"
                        />
                      ) : (
                        <Link
                          to={`/author/${item?.creatorId}`}
                          state={{
                            author: {
                              authorId: item?.creatorId,
                              authorName: item?.creatorName,
                              authorImage: item?.creatorImage,
                            },
                          }}
                          className="author_list_pp"
                        >
                          <img
                            className="lazy"
                            src={item?.creatorImage || AuthorImage}
                            alt={item?.creatorName || "Creator"}
                          />
                          <i className="fa fa-check"></i>
                        </Link>
                      )}

                      {!loading && (
                        <div className="author_list_info">
                          <Link
                            to={`/author/${item?.creatorId}`}
                            state={{
                              author: {
                                authorId: item?.creatorId,
                                authorName: item?.creatorName,
                                authorImage: item?.creatorImage,
                              },
                            }}
                          >
                            {item?.creatorName || "Unknown creator"}
                          </Link>
                        </div>
                      )}
                    </div>

                    <div>
                      <h6>Owner</h6>

                      {loading ? (
                        <Skeleton
                          width="150px"
                          height="50px"
                          borderRadius="5px"
                        />
                      ) : (
                        <>
                          <Link
                            to={`/author/${authorInfo?.authorId || item?.ownerId}`}
                            state={{ author: authorInfo }}
                            className="author_list_pp"
                          >
                            <img
                              className="lazy"
                              src={
                                authorInfo?.authorImage ||
                                item?.ownerImage ||
                                AuthorImage
                              }
                              alt={
                                authorInfo?.authorName ||
                                item?.ownerName ||
                                "Owner"
                              }
                            />
                            <i className="fa fa-check"></i>
                          </Link>

                          <div className="author_list_info">
                            <Link
                              to={`/author/${authorInfo?.authorId || item?.ownerId}`}
                              state={{ author: authorInfo }}
                            >
                              {authorInfo?.authorName ||
                                item?.ownerName ||
                                "Unknown owner"}
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="spacer-40"></div>

                  <div className="de_tab">
                    <div className="de_tab_content">
                      <div className="tab-1">
                        <div className="row">
                          <div className="col-md-6">
                            <h6>Price</h6>

                            {loading ? (
                              <Skeleton
                                width="100px"
                                height="30px"
                                borderRadius="5px"
                              />
                            ) : (
                              <div className="nft-item-price">
                                <img
                                  src={EthImage}
                                  alt="Ethereum"
                                />
                                <span>{item?.price ?? 0} ETH</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="spacer-20"></div>

                  <div className="de_tab">
                    <button className="btn-main">
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ItemDetails;