// src/app/add-listing/page.js
import Link from "next/link";
import styles from "./page.module.css";
import { redirect } from "next/navigation";
import { uploadImageToS3 } from "@/lib/awss3.js";

// Server Action: handles the form submit and uploads the image to S3
export async function uploadListingAction(formData) {
  "use server";

  const title = formData.get("title");
  const category = formData.get("category");
  const condition = formData.get("condition");
  const price = formData.get("price");
  const size = formData.get("size");
  const ageRange = formData.get("ageRange");
  const location = formData.get("location");
  const sellerId = formData.get("sellerId") || "seller1"; // default for now
  const status = "available";
  const description = formData.get("description");

  const file = formData.get("image");
  // Do not enforce size on the server; client will validate and block submit.
  // If somehow no file arrives, just redirect back without error.
  if (!file || typeof file === "string" || !file.arrayBuffer) {
    redirect("/add-listing");
  }

  const { imageUrl } = await uploadImageToS3(file, { folder: "items", filenamePrefix: "item" });

  // Save listing to MongoDB with imageUrls
  const clientPromise = (await import("@/lib/mongodb")).default;
  const client = await clientPromise;
  const db = client.db("TinyThreads");

  const doc = {
    title: String(title),
    price: Number(price),
    size: size ? String(size) : "",
    condition: String(condition),
    imageUrls: [imageUrl],
    description: description ? String(description) : "",
    sellerId: String(sellerId),
    category: String(category),
    ageRange: ageRange ? String(ageRange) : "",
    location: location ? String(location) : "",
    status: status,
    createdAt: new Date(),
  };

  await db.collection("Listings").insertOne(doc);

  // Redirect back to home or a success page
  redirect("/");
}

export default function AddListingPage() {

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <section className={styles.headerSection}>
          <div className={styles.logoContainer}>
            <span className={styles.logo}>👶</span>
            <h1 className={styles.title}>Add New Listing</h1>
          </div>
        </section>

        {/* Form Section */}
        <section className={styles.formSection}>
          <form id="addListingForm" className={styles.listingForm} action={uploadListingAction}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Title</label>
              <input id="title" name="title" type="text" placeholder="e.g. Organic Cotton Onesie - Pink" required />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Category</label>
              <select id="category" name="category" required>
                <option value="">Select category</option>
                <option value="clothing">Clothing</option>
                <option value="toys">Toys</option>
                <option value="books">Books</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="size">Size</label>
              <input id="size" name="size" type="text" placeholder="e.g. 0-3 months" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ageRange">Age Range</label>
              <input id="ageRange" name="ageRange" type="text" placeholder="e.g. 0-3 months" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location">Location</label>
              <input id="location" name="location" type="text" placeholder="City, State (e.g., Fremont, CA)" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="sellerId">Seller ID</label>
              <input id="sellerId" name="sellerId" type="text" placeholder="seller1" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="condition">Condition</label>
              <select id="condition" name="condition" required>
                <option value="">Select condition</option>
                <option value="new">New</option>
                <option value="like-new">Like New</option>
                <option value="good">Good</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">Price ($)</label>
              <input id="price" name="price" type="number" min="0" step="0.01" placeholder="e.g. 20.00" required />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image">Upload Image</label>
              <input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea id="description" name="description" placeholder="Add a short description of the item..." rows="4"></textarea>
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.submitBtn}>Add Listing</button>
              <Link href="/" className={styles.cancelBtn}>Cancel</Link>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}