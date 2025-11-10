"use client";
// src/app/add-listing/page.js
import Link from "next/link";
import styles from "./page.module.css";
import Navbar from "@/components/Navbar/Navbar";
import { useState } from "react";
import { uploadListingAction } from "./actions";

/**
 * AddListingPage — page for submitting a new listing.
 * Handles all client-side validation and UX for instant feedback before submit.
 * (Validation logic mirrors server-side rules in ./actions.js.)
 */
export default function AddListingPage() {
  const [fileErr, setFileErr] = useState("");
  const [titleErr, setTitleErr] = useState("");
  const [sellerNameErr, setSellerNameErr] = useState("");
  const [priceErr, setPriceErr] = useState("");
  const [categoryErr, setCategoryErr] = useState("");
  const [conditionErr, setConditionErr] = useState("");

  // Client-side validation logic (mirrors server rules for instant feedback)
  function validateTitle(value) {
    const v = (value || "").trim();
    if (v.length < 3 || v.length > 150) return "Title must be 3–150 characters.";
    return "";
  }
  function validateSellerName(value) {
    const v = (value || "").trim();
    if (v.length < 2 || v.length > 100) return "Seller name must be 2–100 characters.";
    return "";
  }
  function validatePrice(value) {
    const v = String(value ?? "").trim();
    if (!v) return "Enter a valid price (e.g., 12.99).";
    const num = Number(v);
    if (!Number.isFinite(num) || num < 0) return "Enter a valid price (e.g., 12.99).";
    // allow up to 2 decimals
    if (!/^\d+(?:\.\d{1,2})?$/.test(v)) return "Use up to 2 decimal places.";
    return "";
  }
  function validateRequiredSelect(value, label) {
    if (!value) return `Please select a ${label}.`;
    return "";
  }

  // Field event handlers (validate on blur/change)
  function handleTitleBlur(e) {
    setTitleErr(validateTitle(e.target.value));
  }
  function handleTitleChange(e) {
    if (titleErr) setTitleErr(validateTitle(e.target.value));
  }

  function handleSellerNameBlur(e) {
    setSellerNameErr(validateSellerName(e.target.value));
  }
  function handleSellerNameChange(e) {
    if (sellerNameErr) setSellerNameErr(validateSellerName(e.target.value));
  }

  function handlePriceBlur(e) {
    setPriceErr(validatePrice(e.target.value));
  }
  function handlePriceChange(e) {
    if (priceErr) setPriceErr(validatePrice(e.target.value));
  }

  function handleCategoryChange(e) {
    setCategoryErr(validateRequiredSelect(e.target.value, "category"));
  }
  function handleConditionChange(e) {
    setConditionErr(validateRequiredSelect(e.target.value, "condition"));
  }

  // Global form validation state — disables Submit when any required field fails validation
  function isFormInvalid() {
    // Read current DOM values to avoid storing duplicates in state
    const form = typeof document !== "undefined" && document.getElementById("addListingForm");
    const titleVal = form?.title?.value ?? "";
    const sellerNameVal = form?.sellerName?.value ?? "";
    const priceVal = form?.price?.value ?? "";
    const categoryVal = form?.category?.value ?? "";
    const conditionVal = form?.condition?.value ?? "";

    return Boolean(
      fileErr ||
      validateTitle(titleVal) ||
      validateSellerName(sellerNameVal) ||
      validatePrice(priceVal) ||
      validateRequiredSelect(categoryVal, "category") ||
      validateRequiredSelect(conditionVal, "condition")
    );
  }

  // File upload validation: enforce 5 MB limit client-side for UX (server revalidates)
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) {
      setFileErr("");
      return;
    }
    if (file.size > MAX_SIZE) {
      setFileErr("File above 5 MB, please try again.");
    } else {
      setFileErr("");
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.backSection}>
        <Link href="/" className={styles.backButton}>
          ← Back to Browse
        </Link>
      </div>
      <div className={styles.container}>
        {/* Form Section */}
        <section className={styles.formSection}>
          <form
            id="addListingForm"
            className={styles.listingForm}
            action={uploadListingAction}
          >
            <div className={styles.formGroup}>
              <label htmlFor="title">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Organic Cotton Onesie - Pink"
                required
                onBlur={handleTitleBlur}
                onChange={handleTitleChange}
              />
              {titleErr && (
                <p role="alert" style={{ color: "#c62828", marginTop: "6px", fontSize: "0.9rem" }}>
                  {titleErr}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <select id="category" name="category" required onChange={handleCategoryChange}>
                <option value="">Select category</option>
                <option value="clothing">Clothing</option>
                <option value="toys">Toys</option>
                <option value="books">Books</option>
                <option value="gear">Baby Gear</option>
              </select>
              {categoryErr && (
                <p role="alert" style={{ color: "#c62828", marginTop: "6px", fontSize: "0.9rem" }}>
                  {categoryErr}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="size">Size</label>
              <input
                id="size"
                name="size"
                type="text"
                placeholder="e.g. 0-3 months"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ageRange">Age Range</label>
              <input
                id="ageRange"
                name="ageRange"
                type="text"
                placeholder="e.g. 0-3 months"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="City, State (e.g., Fremont, CA)"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="sellerName">Seller Name</label>
              <input
                id="sellerName"
                name="sellerName"
                type="text"
                placeholder="e.g., Alice Johnson"
                onBlur={handleSellerNameBlur}
                onChange={handleSellerNameChange}
                required
              />
              {sellerNameErr && (
                <p role="alert" style={{ color: "#c62828", marginTop: "6px", fontSize: "0.9rem" }}>
                  {sellerNameErr}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="condition">Condition</label>
              <select id="condition" name="condition" required onChange={handleConditionChange}>
                <option value="">Select condition</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
              {conditionErr && (
                <p role="alert" style={{ color: "#c62828", marginTop: "6px", fontSize: "0.9rem" }}>
                  {conditionErr}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">Price ($)</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 20.00"
                required
                onBlur={handlePriceBlur}
                onChange={handlePriceChange}
              />
              {priceErr && (
                <p role="alert" style={{ color: "#c62828", marginTop: "6px", fontSize: "0.9rem" }}>
                  {priceErr}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image">Upload Image</label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                aria-describedby="imageError"
              />
              {fileErr && (
                <p id="imageError" role="alert" style={{ color: "#c62828", marginTop: "6px", fontSize: "0.9rem" }}>
                  {fileErr}
                </p>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Add a short description of the item..."
                rows="4"
              ></textarea>
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.submitBtn} disabled={isFormInvalid()}>
                Add Listing
              </button>
              <Link href="/" className={styles.cancelBtn}>
                Cancel
              </Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
