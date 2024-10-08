import Link from 'next/link';
import styles from '@/styles/footer.module.scss';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p>Copyright &copy; DJ Events 2021</p>
            <p>
                <Link href="/about">About this project ;)</Link>
            </p>
        </footer>
    );
};

export default Footer;
