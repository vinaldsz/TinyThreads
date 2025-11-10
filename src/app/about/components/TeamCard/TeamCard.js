import styles from './TeamCard.module.css'
import Image from 'next/image'

export default function TeamCard({ name, role, description, image, altText }) {
  return (
    <div className={styles.card}>
      <Image 
        src={image} 
        alt={altText}
        width={120}
        height={120}
        className={styles.avatar}
      />
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.role}>{role}</p>
      <p className={styles.description}>{description}</p>
    </div>
  )
}