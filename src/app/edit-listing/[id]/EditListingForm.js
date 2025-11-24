'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateListingAction } from './actions';
import styles from './EditListingForm.module.css';

export default function EditListingForm({ item }) {
  const router = useRouter();

  const [formState, setFormState] = useState({
    title: item.title || '',
    price: item.price ?? 0,
    size: item.size || '',
    condition: item.condition || '',
    description: item.description || '',
    category: item.category || '',
    ageRange: item.ageRange || '',
    location: item.location || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData(e.currentTarget);
      formData.append('id', item._id); // ensure id is there

      const result = await updateListingAction(formData);

      if (result?.error) {
        setErrorMsg(result.error);
        setIsSubmitting(false);
        return;
      }

      router.push(`/Items/${item._id}`);
    } catch (err) {
      console.error('Error updating listing:', err);
      setErrorMsg('Something went wrong while saving. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      {errorMsg && <p className={styles.errorBox}>{errorMsg}</p>}

      <input type="hidden" name="id" value={item._id} />

      <div className={styles.field}>
        <label className={styles.label}>
          Title
          <input
            name="title"
            value={formState.title}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Price
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formState.price}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Size
          <input
            name="size"
            value={formState.size}
            onChange={handleChange}
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Condition
          <select
            name="condition"
            value={formState.condition}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="">Select condition</option>
            <option value="new">New</option>
            <option value="like new">Like new</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
          </select>
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Category
          <input
            name="category"
            value={formState.category}
            onChange={handleChange}
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Age range
          <input
            name="ageRange"
            value={formState.ageRange}
            onChange={handleChange}
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Location
          <input
            name="location"
            value={formState.location}
            onChange={handleChange}
            className={styles.input}
          />
        </label>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>
          Description
          <textarea
            name="description"
            value={formState.description}
            onChange={handleChange}
            className={styles.textarea}
          />
        </label>
      </div>

      {/* Optional: image upload field for replacing images */}
      <div className={styles.field}>
        <label className={styles.label}>
          Replace images
          <input type="file" name="image" multiple accept="image/*" />
        </label>
        <p className={styles.helpText}>
          If you select new images, they will replace the existing ones.
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={styles.submitBtn}
      >
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
