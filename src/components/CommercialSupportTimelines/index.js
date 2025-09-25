import Link from '@docusaurus/Link';
import {getReleaseBranches} from '../RabbitMQServerReleaseInfo';
import styles from "./index.module.css"

const releaseDateOptions = { year: 'numeric', month: 'short' };
const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };

function getTimelineRows(releaseBranches) {
  const now = Date.now();
  const rows = [];
  let previousReleaseDate;

  for (const branch in releaseBranches) {
    const releaseBranch = releaseBranches[branch];
    const isReleased = typeof releaseBranch.end_of_support !== 'undefined';
    const releases = releaseBranch.releases || [];
    if (!isReleased || releases.length === 0) {
      continue;
    }

    const minorRelease = releases[releases.length - 1];
    const releaseDate = new Date(minorRelease.release_date);

    const endOfCommunitySupportDate =
        releaseBranch.end_of_community_support
            ? new Date(
                  releaseBranch.end_of_community_support
              )
            : previousReleaseDate;

    const endOfCommercialSupportDate = new Date(releaseBranch.end_of_support);

    const isCommunitySupported = endOfCommunitySupportDate === undefined || endOfCommunitySupportDate > now;
    const isCommercialSupported = endOfCommercialSupportDate > now;

    const endOfCommunitySupport =
        endOfCommunitySupportDate === undefined
            ? 'Next Release'
            : endOfCommunitySupportDate.toLocaleDateString('en-GB', dateOptions);
    const endOfCommercialSupport = endOfCommercialSupportDate.toLocaleDateString("en-GB", dateOptions);

    rows.push({
      release: branch,
      releaseDate: releaseDate.toLocaleDateString("en-GB", releaseDateOptions),
      endOfCommunitySupport,
      endOfCommercialSupport,
      isCommunitySupported,
      isCommercialSupported
    });

    previousReleaseDate = new Date(minorRelease.release_date);
  }

  return rows;
}

export function CommercialSupportTimelines() {
  const releaseBranches = getReleaseBranches();

  const rows = getTimelineRows(releaseBranches);
  console.log(rows)

  return (
    <div className="release-information">
      <table className={styles.timelines_table}>
        <thead>
          <tr>
            <th>Release</th>
            <th>Date of Release</th>
            <th>End of Community Support</th>
            <th>End of Commercial Support*</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.release}>
              <td>{row.release}</td>
              <td>{row.releaseDate}</td>
              <td className={row.isCommunitySupported ? styles.supported : styles.unsupported}>
                {row.endOfCommunitySupport}
              </td>
              <td className={row.isCommercialSupported ? styles.supported : styles.unsupported}>
                {row.endOfCommercialSupport}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        *End of Commercial Support dates are indicative. Official commercial support lifecycle information can be found on the <Link to="https://support.broadcom.com/web/ecx/productlifecycle">Broadcom support portal</Link>.
      </p>
      <div>
        <strong>Legend:</strong>
        <dl className="release-legend">
          <dt className="supported-release latest-release"></dt>
          <dd>Latest release series, fully supported</dd>
          <dt className="unsupported-release"></dt>
          <dd>Older release series, unsupported</dd>
        </dl>
      </div>
    </div>
  );
}
