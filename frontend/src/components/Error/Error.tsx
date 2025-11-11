import { NavigateFunction } from "react-router-dom";
import styles from "./Error.module.css";

export const Error = (navigate:NavigateFunction , message:string) => {

    if (message) {
        return (
          <div className={styles.errorContainer}>
            <h2>Error</h2>
            <p>{message}</p>
            <button onClick={() => navigate(-1)} className={styles.backButton}>
              Go back
            </button>
          </div>
        );
      }
};