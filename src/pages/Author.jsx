import React, { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import AuthorBanner from "../images/author_banner.jpg";
import AuthorItems from "../components/author/AuthorItems";
import AuthorImage from "../images/author_thumbnail.jpg";
import axios from "axios";
import Skeleton from "../components/UI/Skeleton";

const Author = () => {
  const { authorId } = useParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [authorId]);

  const correctedAuthorId = authorId === "1" ? "83937449" : authorId;
  const location = useLocation();
  const author = location.state?.author;

  const normalizedAuthor =
    author?.authorId === 1
      ? {
          ...author,
          authorId: 83937449,
          authorName: "Monica Lucas",
        }
      : author;

  const [authorInfo, setAuthorInfo] = useState(normalizedAuthor || null);

  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const isLoading = loading || itemsLoading;
  const [copied, setCopied] = useState(false);

  const handleFollow = () => {
    if (isFollowing) {
      // Unfollow: decrease followers by 1
      setAuthorInfo((prev) => ({
        ...prev,
        followers: Math.max(0, (Number(prev?.followers) || 0) - 1),
      }));

      setIsFollowing(false);
    } else {
      // Follow: increase followers by 1
      setAuthorInfo((prev) => ({
        ...prev,
        followers: (Number(prev?.followers) || 0) + 1,
      }));

      setIsFollowing(true);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(authorInfo.address);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error("Unable to copy address:", error);
    }
  };

  useEffect(() => {
    let timer;
    let isMounted = true;

    const controller = new AbortController();

    const fetchAuthor = async () => {
      try {
        setLoading(true);

        console.log("Author ID being requested:", correctedAuthorId);

        const response = await axios.get(
          "https://us-central1-nft-cloud-functions.cloudfunctions.net/authors",
          {
            params: {
              author: correctedAuthorId,
            },
            signal: controller.signal,
          }
        );

        console.log("API status:", response.status);
        console.log("Full API response:", response.data);

        const fetchedAuthor = Array.isArray(response.data)
          ? response.data[0]
          : response.data.author || response.data;

        console.log("Fetched author:", fetchedAuthor);

        if (isMounted && fetchedAuthor) {
          setAuthorInfo(fetchedAuthor);
        }
      } catch (error) {
        if (isMounted && !controller.signal.aborted) {
          console.error("API error:", error);
          console.error("Error response:", error.response?.data);
          console.error("Status:", error.response?.status);
        }
      } finally {
        if (isMounted) {
          timer = setTimeout(() => {
            setLoading(false);
          }, 1500);
        }
      }
    };

    if (correctedAuthorId) {
      fetchAuthor();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [correctedAuthorId]);

  return (
    <div id="wrapper">
      <div className="no-bottom no-top" id="content">
        <div id="top"></div>

        <section
          id="profile_banner"
          aria-label="section"
          className="text-light"
          style={{ background: `url(${AuthorBanner}) top` }}
        ></section>

        <section aria-label="section">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="d_profile de-flex">
                  <div className="de-flex-col">
                    <div className="profile_avatar">
                      {isLoading ? (
                        <Skeleton
                          width="100px"
                          height="100px"
                          borderRadius="50%"
                        />
                      ) : (
                        <img
                          src={authorInfo?.authorImage || AuthorImage}
                          alt={authorInfo?.authorName || "Author"}
                        />
                      )}

                      {!isLoading && <i className="fa fa-check"></i>}

                      <div className="profile_name">
                        <h4>
                          {isLoading ? (
                            <>
                              {/* Author name skeleton */}
                              <Skeleton
                                width="150px"
                                height="22px"
                                borderRadius="5px"
                              />

                              {/* Username skeleton */}
                              <div style={{ marginTop: "5px" }}>
                                <Skeleton
                                  width="100px"
                                  height="15px"
                                  borderRadius="5px"
                                />
                              </div>

                              {/* Address skeleton */}
                              <div style={{ marginTop: "8px" }}>
                                <Skeleton
                                  width="250px"
                                  height="12px"
                                  borderRadius="5px"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Author name */}
                              {authorInfo?.authorName || "Author"}

                              {/* Username */}
                              <span className="profile_username">
                                {authorInfo?.tag ? `@${authorInfo.tag}` : ""}
                              </span>

                              {/* Address and copy button */}
                                {authorInfo?.address && (
                                  <div className="profile_address">
                                    <span className="profile_address_text">
                                      {authorInfo.address}
                                    </span>
                                    <button
                                      type="button"
                                      className="profile_copy_button fa fa-copy"
                                      onClick={handleCopyAddress}
                                      aria-label={copied ? "Copied!" : "Copy"}
                                      data-tooltip={copied ? "Copied!" : "Copy"}
                                    />
                                  </div>
                                )}
                            </>
                          )}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="profile_follow de-flex">
                    <div className="de-flex-col">
                      {loading ? (
                        <Skeleton
                          width="130px"
                          height="25px"
                          borderRadius="5px"
                        />
                      ) : (
                        <h4>
                          {authorInfo?.followers ?? 0}
                          <span> followers</span>
                        </h4>
                      )}
                    </div>
                    <div className="de-flex-col">
                      <button
                        className="btn-main"
                        onClick={handleFollow}
                        type="button"
                      >
                        {isFollowing ? "Unfollow" : "Follow"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-12">
                <div className="de_tab tab_simple">
                  <AuthorItems
                    author={authorInfo}
                    onLoadingChange={setItemsLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Author;