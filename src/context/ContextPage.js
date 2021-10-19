import React, { useState, useEffect } from "react";
import ContextObject from "./ContextObject";
import sanity from "../libs/sanity";
import imageUrlBuilder from "@sanity/image-url";
import Skeleton from "react-loading-skeleton";
import Image from "react-bootstrap/lib/Image";
import help from "../assets/help.png";
import BlockContent from "@sanity/block-content-to-react";
import add from "../assets/add.png";
import Slide from "@material-ui/core/Slide";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import SuggestionModal from "./SuggestionModal";
import { I18n } from "@aws-amplify/core";
import Tour from "reactour";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";
import "react-accessible-accordion/dist/fancy-example.css";
import ExternalSiteModal from "./ExternalSiteModal";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const builder = imageUrlBuilder(sanity);

/**
 * The Digest page, displaying Context Objects about a particular topic.
 * @TODO Issue #27
 */

function ContextPage(props) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [community, setCommunity] = useState([]);
  const [support, setSupport] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [news, setNews] = useState([]);
  const [assorted, setAssorted] = useState([]);
  const [schema, setSchema] = useState("");
  const [renderType, setRenderType] = useState("generic");
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [schemaObject, setSchemaObject] = useState({
    body: [],
    description: "",
    mainImage: {
      asset: {
        _ref: "",
      },
    },
    title: "",
  });
  const [openModal, setOpenModal] = useState(false);
  const [externalModal, setExternalModal] = useState({
    display: false,
    url: "",
  });

  function openExternalModal(url) {
    setExternalModal({ display: true, url });
  }

  function closeExternalModal() {
    setExternalModal({ display: false, url: "" });
  }

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    fetchSanityResources();
  }, []);

  async function fetchSanityResources() {
    let tempPath = window.location.pathname.split("/");
    if (tempPath[1] === "hubs") {
      setRenderType("hubs");
    }
    let schemaObj = tempPath[2];
    setSchema(schemaObj);
    const query = `*[_type == '${schemaObj}Schema' && !(_id in path("drafts.**"))]`;
    const links = await sanity.fetch(query);
    setItems(links);
    let tempCommunity = [];
    let tempSupport = [];
    let tempCompanies = [];
    let tempNews = [];
    let tempAssorted = [];
    if (tempPath[1] === "hubs") {
      links.map((link, idx) => {
        if (
          link.type === "community" ||
          link.type === "education" ||
          link.type === "social" ||
          link.type === "leader"
        ) {
          tempCommunity.push(link);
        } else if (link.type === "incubators" || link.type === "vc") {
          tempSupport.push(link);
        } else if (link.type === "companies" || link.type === "marketplace") {
          tempCompanies.push(link);
        } else if (link.type === "news") {
          tempNews.push(link);
        } else {
          tempAssorted.push(link);
        }
      });
      setCommunity(tempCommunity);
      setSupport(tempSupport);
      setCompanies(tempCompanies);
      setNews(tempNews);
      setAssorted(tempAssorted);
    }
  }

  useEffect(() => {
    if (props.sanitySchemas.technicalSchemas.length > 0) {
      let tempPath = window.location.pathname.split("/");
      let schema = tempPath[2];
      let sObj;
      // possible to refactor??
      props.sanitySchemas.technicalSchemas.map((obj, idx) => {
        if (obj.slug.current === schema) {
          sObj = obj;
          setSchemaObject(sObj);
          setLoading(false);
        }
      });
      props.sanitySchemas.economicSchemas.map((obj, idx) => {
        if (obj.slug.current === schema) {
          sObj = obj;
          setSchemaObject(sObj);
          setLoading(false);
        }
      });
      props.sanitySchemas.hubSchemas.map((obj, idx) => {
        if (obj.slug.current === schema) {
          sObj = obj;
          setSchemaObject(sObj);
          setLoading(false);
        }
      });
    }
  }, [props.sanitySchemas]);

  const steps = [
    {
      selector: ".third-step-library",
      content: `${I18n.get("libraryThird")}`,
    },
  ];

  return (
    <div style={{ marginTop: 10 }}>
      <div className="flex">
        {renderType === "generic" ? (
          <h1>{schemaObject.title}</h1>
        ) : (
          <h1>Welcome to {schemaObject.title}</h1>
        )}
        <img
          src={add}
          alt="Suggest Resource"
          height="60"
          width="60"
          style={{ cursor: "pointer", marginTop: 20, marginLeft: 10 }}
          onClick={() => {
            setOpenModal(true);
          }}
          className="third-step-library"
        />
        <Image
          src={help}
          onClick={() => {
            setIsTourOpen(true);
          }}
          height="40"
          width="40"
          circle
          style={{ cursor: "pointer", margin: 30, marginLeft: 10 }}
        />
      </div>

      {renderType === "hubs" ? (
        <React.Fragment>
          <BlockContent blocks={schemaObject.body} />

          <h3>Local Communities & Meetups</h3>
          {community.length === 0 ? (
            <p
              className="flex"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              Click&nbsp;
              <p style={{ cursor: "pointer", textDecoration: "underline" }}>
                {" "}
                here{" "}
              </p>
              &nbsp;to suggest a resource into our community knowledge base.
            </p>
          ) : (
            <div className="context-cards-start">
              {community.map((item, i) => {
                function urlFor(source) {
                  return builder.image(source);
                }
                let url;
                if (!item.logo && !item.mainImage) {
                  url = "na";
                } else if (!item.logo && item.mainImage) {
                  url = urlFor(item.mainImage.asset._ref);
                } else {
                  url = urlFor(item.logo.asset._ref);
                }

                return (
                  <React.Fragment key={i}>
                    {loading === true ? (
                      <React.Fragment>
                        <Skeleton width={250} height={200} />
                      </React.Fragment>
                    ) : (
                      <ContextObject
                        {...item}
                        img={url.toString()}
                        openExternalModal={openExternalModal}
                        closeExternalModal={closeExternalModal}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
          <h3>Start-up Incubators & Venture Capital</h3>
          {support.length === 0 ? (
            <p
              className="flex"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              Click&nbsp;
              <p style={{ cursor: "pointer", textDecoration: "underline" }}>
                {" "}
                here{" "}
              </p>
              &nbsp;to suggest a resource into our community knowledge base.
            </p>
          ) : (
            <div className="context-cards-start">
              {support.map((item, i) => {
                function urlFor(source) {
                  return builder.image(source);
                }
                let url;
                if (!item.logo && !item.mainImage) {
                  url = "na";
                } else if (!item.logo && item.mainImage) {
                  url = urlFor(item.mainImage.asset._ref);
                } else {
                  url = urlFor(item.logo.asset._ref);
                }
                if (item.type === "incubators" || item.type === "vc") {
                  return (
                    <React.Fragment key={i}>
                      {loading === true ? (
                        <React.Fragment>
                          <Skeleton width={250} height={200} />
                        </React.Fragment>
                      ) : (
                        <ContextObject
                          {...item}
                          img={url.toString()}
                          openExternalModal={openExternalModal}
                          closeExternalModal={closeExternalModal}
                        />
                      )}
                    </React.Fragment>
                  );
                }
              })}
            </div>
          )}
          <h3>Hot Startups & Hiring Co's</h3>
          {companies.length === 0 ? (
            <p
              className="flex"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              Click&nbsp;
              <p style={{ cursor: "pointer", textDecoration: "underline" }}>
                {" "}
                here{" "}
              </p>
              &nbsp;to suggest a resource into our community knowledge base.
            </p>
          ) : (
            <div className="context-cards-start">
              {companies.map((item, i) => {
                function urlFor(source) {
                  return builder.image(source);
                }
                let url;
                if (!item.logo && !item.mainImage) {
                  url = "na";
                } else if (!item.logo && item.mainImage) {
                  url = urlFor(item.mainImage.asset._ref);
                } else {
                  url = urlFor(item.logo.asset._ref);
                }
                if (item.type === "companies" || item.type === "marketplace") {
                  return (
                    <React.Fragment key={i}>
                      {loading === true ? (
                        <React.Fragment>
                          <Skeleton width={250} height={200} />
                        </React.Fragment>
                      ) : (
                        <ContextObject
                          {...item}
                          img={url.toString()}
                          openExternalModal={openExternalModal}
                          closeExternalModal={closeExternalModal}
                        />
                      )}
                    </React.Fragment>
                  );
                }
              })}
            </div>
          )}
          <h3>Local News & Industry Trends</h3>
          {news.length === 0 ? (
            <p
              className="flex"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              Click&nbsp;
              <p style={{ cursor: "pointer", textDecoration: "underline" }}>
                {" "}
                here{" "}
              </p>
              &nbsp;to suggest a resource into our community knowledge base.
            </p>
          ) : (
            <div className="context-cards-start">
              {news.map((item, i) => {
                function urlFor(source) {
                  return builder.image(source);
                }
                let url;
                if (!item.logo && !item.mainImage) {
                  url = "na";
                } else if (!item.logo && item.mainImage) {
                  url = urlFor(item.mainImage.asset._ref);
                } else {
                  url = urlFor(item.logo.asset._ref);
                }
                if (item.type === "news") {
                  return (
                    <React.Fragment key={i}>
                      {loading === true ? (
                        <React.Fragment>
                          <Skeleton width={250} height={200} />
                        </React.Fragment>
                      ) : (
                        <ContextObject
                          {...item}
                          img={url.toString()}
                          openExternalModal={openExternalModal}
                          closeExternalModal={closeExternalModal}
                        />
                      )}
                    </React.Fragment>
                  );
                }
              })}
            </div>
          )}
          <h3>The Best of the Rest</h3>
          {assorted.length === 0 ? (
            <p
              className="flex"
              onClick={() => {
                setOpenModal(true);
              }}
            >
              Click&nbsp;
              <p style={{ cursor: "pointer", textDecoration: "underline" }}>
                {" "}
                here{" "}
              </p>
              &nbsp;to suggest a resource into our community knowledge base.
            </p>
          ) : (
            <div className="context-cards-start">
              {assorted.map((item, i) => {
                function urlFor(source) {
                  return builder.image(source);
                }
                let url;
                if (!item.logo && !item.mainImage) {
                  url = "na";
                } else if (!item.logo && item.mainImage) {
                  url = urlFor(item.mainImage.asset._ref);
                } else {
                  url = urlFor(item.logo.asset._ref);
                }
                if (item.type === "news") {
                  return (
                    <React.Fragment key={i}>
                      {loading === true ? (
                        <React.Fragment>
                          <Skeleton width={250} height={200} />
                        </React.Fragment>
                      ) : (
                        <ContextObject
                          {...item}
                          img={url.toString()}
                          openExternalModal={openExternalModal}
                          closeExternalModal={closeExternalModal}
                        />
                      )}
                    </React.Fragment>
                  );
                }
              })}
            </div>
          )}
        </React.Fragment>
      ) : null}
      {/* This is the render for non-city based pages. */}
      {renderType === "generic" ? (
        <React.Fragment>
          <h2>{schemaObject.description}</h2>
          <Accordion allowMultipleExpanded allowZeroExpanded>
            <AccordionItem>
              <AccordionItemHeading>
                <AccordionItemButton>Read Overview</AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel>
                <BlockContent blocks={schemaObject.body} />
              </AccordionItemPanel>
            </AccordionItem>
          </Accordion>

          <h3>
            Pareto curated resources below - tap or click to open in a new tab.
          </h3>
          <div className="context-cards">
            {items.map((item, i) => {
              function urlFor(source) {
                return builder.image(source);
              }
              let url;
              if (!item.logo && !item.mainImage) {
                url = "na";
              } else if (!item.logo && item.mainImage) {
                url = urlFor(item.mainImage.asset._ref);
              } else {
                url = urlFor(item.logo.asset._ref);
              }
              return (
                <React.Fragment key={i}>
                  {loading === true ? (
                    <React.Fragment>
                      <Skeleton width={250} height={200} />
                    </React.Fragment>
                  ) : (
                    <ContextObject
                      {...item}
                      img={url.toString()}
                      openExternalModal={openExternalModal}
                      closeExternalModal={closeExternalModal}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </React.Fragment>
      ) : null}
      {/* Modal Component */}
      <Dialog
        style={{
          margin: "auto",
        }}
        open={openModal}
        onClose={handleCloseModal}
        TransitionComponent={Transition}
        keepMounted
        hideBackdrop={false}
        aria-labelledby="Suggestion Form"
        aria-describedby="Please write the details of the resource you are suggesting."
      >
        <SuggestionModal
          handleClose={handleCloseModal}
          schema={schema}
          user={props.user}
        />
      </Dialog>

      <Dialog
        style={{
          margin: "auto",
        }}
        open={externalModal.display}
        onClose={closeExternalModal}
        TransitionComponent={Transition}
        keepMounted
        hideBackdrop={false}
      >
        <ExternalSiteModal url={externalModal.url} />

        <Button
          size="small"
          variant="contained"
          color="primary"
          style={{
            padding: "10px",
            fontSize: "20px",
          }}
          onClick={() => {
            let win = window.open(externalModal.url, "_blank");
            win.focus();
          }}
        >
          Open External Link
        </Button>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          style={{
            padding: "10px",
            fontSize: "20px",
          }}
          onClick={() => closeExternalModal()}
        >
          Close
        </Button>
      </Dialog>

      {/* { externalModal.display ? <ExternalSiteModal url={externalModal.url} /> : null } */}

      <Tour
        steps={steps}
        isOpen={isTourOpen}
        onRequestClose={() => setIsTourOpen(false)}
        showCloseButton={true}
        rewindOnClose={false}
      />
    </div>
  );
}

export default ContextPage;
