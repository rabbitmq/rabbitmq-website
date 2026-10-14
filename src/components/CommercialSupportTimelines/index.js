import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SupportTimeline from './SupportTimeline';
import styles from "./index.module.css"

const supportPhaseLabels = {
  oss: 'OSS support',
  enterprise: 'Enterprise support',
  expert: 'Supported with Expert Services',
  future: 'Future release',
};

const DAY = 24 * 60 * 60 * 1000;

function formatDate(date, isReleaseDate) {
  const year = date.toLocaleDateString("en-US", { year: "numeric", timeZone: "UTC" });
  const month = date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  if (isReleaseDate) {
    return `${month} ${year}`;
  }
  const day = date.toLocaleDateString("en-US", { day: "numeric", timeZone: "UTC" });
  return `${day} ${month} ${year}`;
}

function getTimelineRow({release, releaseDateValue, endOfCommunitySupportDate, endOfCommercialSupportDate, isPlanned = false}, now) {
  const isCommunitySupported = !isPlanned && (endOfCommunitySupportDate === undefined || endOfCommunitySupportDate.getTime() + DAY > now);
  const isCommercialSupported = !isPlanned && endOfCommercialSupportDate.getTime() + DAY > now;
  const supportPhase = isPlanned ? 'future' : isCommunitySupported ? 'oss' : isCommercialSupported ? 'enterprise' : 'expert';

  return {
    release,
    releaseDate: `${formatDate(releaseDateValue, true)}${isPlanned ? ' (Future)' : ''}`,
    endOfCommunitySupport: endOfCommunitySupportDate === undefined
      ? 'Next Release'
      : formatDate(endOfCommunitySupportDate, false),
    endOfCommercialSupport: formatDate(endOfCommercialSupportDate, false),
    isCommunitySupported,
    isCommercialSupported,
    supportPhase,
    releaseDateValue,
    endOfCommunitySupportDate,
    endOfCommercialSupportDate,
    isPlanned,
  };
}

function getTimelineRows(releaseBranches, plannedReleases, now) {
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

    rows.push(getTimelineRow({
      release: branch,
      releaseDateValue: releaseDate,
      endOfCommunitySupportDate,
      endOfCommercialSupportDate
    }, now));

    const d = new Date(minorRelease.release_date);
    previousReleaseDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  }

  for (const release of plannedReleases) {
    // Published release metadata replaces the plan as soon as it is available.
    if (rows.some((row) => row.release === release.version)) {
      continue;
    }
    rows.push(getTimelineRow({
      release: release.version,
      // A planned month does not specify a release day; plot its first day.
      releaseDateValue: new Date(`${release.release_month}-01`),
      endOfCommunitySupportDate: new Date(release.end_of_community_support),
      endOfCommercialSupportDate: new Date(release.end_of_support),
      isPlanned: true,
    }, now));
  }

  return rows.sort((a, b) => b.releaseDateValue - a.releaseDateValue);
}

export function CommercialSupportTimelines() {
  const {siteConfig} = useDocusaurusContext();
  const {rabbitmq: releaseBranches} = siteConfig.customFields.releaseBranches;
  const plannedReleases = siteConfig.customFields.plannedRabbitMQReleases || [];
  const now = Date.now();
  const rows = getTimelineRows(releaseBranches, plannedReleases, now);

  return (
    <div className={`release-information ${styles.supportTimelines}`}>
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
              <td>
                <span className={styles.release}>
                  <span className={`${styles.status} ${styles[row.supportPhase]}`} role="img" aria-label={supportPhaseLabels[row.supportPhase]} />
                  {row.release}
                </span>
              </td>
              <td className={row.isPlanned ? undefined : styles.past}>{row.releaseDate}</td>
              <td className={!row.isPlanned && !row.isCommunitySupported ? styles.past : undefined}>
                {row.endOfCommunitySupport}
              </td>
              <td className={!row.isPlanned && !row.isCommercialSupported ? styles.past : undefined}>
                {row.endOfCommercialSupport}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        *End of Commercial Support dates are indicative. Official commercial support lifecycle information can be found on the <Link to="https://support.broadcom.com/web/ecx/productlifecycle">Broadcom support portal</Link>.
      </p>
      <SupportTimeline rows={rows} now={now} />
    </div>
  );
}
