import Link from '@docusaurus/Link';

import styles from './index.module.css';

export default function SupportTimelines() {
  return (
    <div>
      <table className={styles.timelines_table}>
        <thead>
          <tr>
            <th>Release</th>
            <th>Patch</th>
            <th>Date of Release</th>
            <th>End of Community Support</th>
            <th>End of Commercial Support*</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>4.1</td>
            <td>4.1.3</td>
            <td>4 Aug 2025</td>
            <td className={styles.supported}>Next Release</td>
            <td className={styles.supported}>30 Apr 2028</td>
          </tr>
          <tr>
            <td>4.0</td>
            <td>4.0.9</td>
            <td>13 Apr 2025</td>
            <td className={styles.unsupported}>14 Apr 2025</td>
            <td className={styles.supported}>29 Sep 2027</td>
          </tr>
          <tr>
            <td>3.13</td>
            <td>3.13.7</td>
            <td>25 Aug 2024</td>
            <td className={styles.unsupported}>17 Sep 2024</td>
            <td className={styles.supported}>30 Dec 2027</td>
          </tr>
          <tr>
            <td>3.12</td>
            <td>3.12.14</td>
            <td>5 May 2024</td>
            <td className={styles.unsupported}>21 Feb 2024</td>
            <td className={styles.unsupported}>30 Jun 2025</td>
          </tr>
          <tr>
            <td>3.11</td>
            <td>3.11.28</td>
            <td>21 Dec 2023</td>
            <td className={styles.unsupported}>1 Jun 2023</td>
            <td className={styles.unsupported}>30 Jun 2024</td>
          </tr>
          <tr>
            <td>3.10</td>
            <td>3.10.25</td>
            <td>17 Jul 2023</td>
            <td className={styles.unsupported}>27 Sep 2022</td>
            <td className={styles.unsupported}>30 Jun 2024</td>
          </tr>
        </tbody>
      </table>
      <p>
        *End of Commercial Support dates are indicative. Official commercial support lifecycle information can be found on the <Link to="https://support.broadcom.com/web/ecx/productlifecycle">Broadcom support portal</Link>.
      </p>
      <div>
        <strong>Legend:</strong>
        <div className={styles.legend_item}>
          <span className={styles.supported_legend} />Latest Release, fully supported
        </div>
        <div className={styles.legend_item}>
          <span className={styles.unsupported_legend} />Old Release, unsupported
        </div>
      </div>
    </div>
  );
}
