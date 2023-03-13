import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Layout from "../components/common/Layout";
import ImageSection from "../components/product/ImageSection";
import ProductMain from "../components/product/ProductMain";
import ProductRelated from "../components/product/ProductRelated";
import ProductReviews from "../components/product/ProductReviews";
import {
  clearProductDetails,
  fetchProductDetails,
  getProductDetails,
  getProductError,
  getProductStatus,
} from "../redux/slice/productSlice";

const Product = () => {
  const id = useParams().id;
  const dispatch = useDispatch();
  const productData = useSelector(getProductDetails);
  const status = useSelector(getProductStatus);
  const error = useSelector(getProductError);

  useEffect(() => {
    dispatch(fetchProductDetails(id));

    return () => {
      dispatch(clearProductDetails());
    };
  }, []);
  return (
    <Layout>
      <div className="container sm:py-12 py-6">
        {status === "loading" ? <p>Loading...</p> : null}
        {status === "failed" ? <p>{error}</p> : null}
        {status === "success" ? (
          <div className="flex flex-col gap-[3rem]">
            <div className="flex sm:flex-row flex-col gap-8 justify-between">
              <ImageSection
                imageURL={productData.imageURL}
                imageURLHighRes={productData.imageURLHighRes}
              />
              <ProductMain />
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="heading3">Description</h3>
              <p className="text-[#2e2e2e] tex-sm">{productData.description}</p>
            </div>

            <ProductRelated />

            <ProductReviews />
          </div>
        ) : null}
      </div>
    </Layout>
  );
};

export default Product;
